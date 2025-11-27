import os
import sys
import json
from weasyprint import HTML, CSS
import weasyprint
import pydyf
from os import path
from string import Template
import base64

def generate_pdf(data):
    # Validate data structure
    if not isinstance(data, dict):
        raise ValueError("Data must be a dictionary")
    
    # Ensure all required sections exist with defaults
    finance_data = data.get('finance', {})
    finance_entries = finance_data.get('entries', []) if isinstance(finance_data, dict) else []
    
    sales_data = data.get('sales', {})
    sales_entries = sales_data.get('entries', []) if isinstance(sales_data, dict) else []
    
    operations_data = data.get('operations', {})
    operations_entries = operations_data.get('entries', []) if isinstance(operations_data, dict) else []
    
    marketing_data = data.get('marketing', {})
    marketing_tasks = marketing_data.get('tasks', []) if isinstance(marketing_data, dict) else []
    
    trips_data = data.get('trips', {})
    trips_entries = trips_data.get('entries', []) if isinstance(trips_data, dict) else []
    
    # Generate HTML for financial entries
    html_entries = ""
    for i, entry in enumerate(finance_entries):
        type_text = {'income': 'إيراد', 'expense': 'مصروف', 'deposit': 'إيداع'}[entry['type']]
        amount_formatted = f"{entry['amount']:.2f}"
        html_entries += f"""
        <div class="item">
            <div class="item-header">
                <span class="item-title">{i + 1}. {entry['title']}</span>
                <div class="item-meta">
                    <span class="item-amount">{amount_formatted}</span>
                    <span class="chip" style="background-color: {'#4CAF50' if entry['type'] == 'income' else '#F44336' if entry['type'] == 'expense' else '#2196F3'};">{type_text}</span>
                </div>
            </div>
        </div>
        """
    
    # Generate HTML for sales entries
    html_sales_entries = ""
    for i, entry in enumerate(sales_entries):
        outcome_text = {'positive': 'إيجابي', 'negative': 'سلبي', 'pending': 'في الانتظار'}[entry['outcome']]
        html_sales_entries += f"""
        <div class="item">
            <div class="item-header">
                <span class="item-title">{i + 1}. {entry['customerName']}</span>
                <div class="item-meta">
                    <span class="chip" style="background-color: {'#4CAF50' if entry['outcome'] == 'positive' else '#F44336' if entry['outcome'] == 'negative' else '#FFC107'};">{outcome_text}</span>
                </div>
            </div>
            <p style="margin: 5px 0 0;">الاجتماع: {entry['meetingTime']} - {entry['contactNumber']}</p>
            {'<p style="margin: 5px 0 0;">ملاحظات: ' + entry['notes'] + '</p>' if entry['notes'] else ''}
        </div>
        """

    # Generate HTML for operations entries
    html_operations_entries = ""
    for i, entry in enumerate(operations_entries):
        status_text = {'completed': 'مكتمل', 'in-progress': 'قيد التنفيذ', 'pending': 'في الانتظار'}[entry['status']]
        html_operations_entries += f"""
        <div class="item">
            <div class="item-header">
                <span class="item-title">{i + 1}. {entry['task']}</span>
                <div class="item-meta">
                    <span class="chip" style="background-color: {'#4CAF50' if entry['status'] == 'completed' else '#FFC107' if entry['status'] == 'in-progress' else '#9E9E9E'};">{status_text}</span>
                </div>
            </div>
            <p style="margin: 5px 0 0;">المسؤول: {entry['owner']}</p>
            <div style="clear: both;"></div>
        </div>
        """

    # Generate HTML for marketing tasks
    html_marketing_tasks = ""
    for i, task in enumerate(marketing_tasks):
        status_text = {'completed': 'مكتمل', 'in-progress': 'قيد التنفيذ', 'planned': 'مخطط'}[task['status']]
        html_marketing_tasks += f"""
        <div class="item">
            <div class="item-header">
                <span class="item-title">{i + 1}. {task['title']}</span>
                <div class="item-meta">
                    <span class="chip" style="background-color: {'#4CAF50' if task['status'] == 'completed' else '#FFC107' if task['status'] == 'in-progress' else '#2196F3'};">{status_text}</span>
                </div>
            </div>
        </div>
        """

    html_trips_entries = ""
    for i, trip in enumerate(trips_entries):
        status_text = 'جاهز' if trip.get('status') == 'approved' else 'تنبيه'
        status_color = '#16a34a' if trip.get('status') == 'approved' else '#f59e0b'
        html_trips_entries += f"""
        <div class="item">
            <div class="item-header">
                <span class="item-title">{i + 1}. {trip.get('bookingId', '')} - {trip.get('clientName', '')}</span>
                <div class="item-meta">
                    <span class="chip" style="background-color: {status_color};">{status_text}</span>
                </div>
            </div>
            <p style="margin: 4px 0 0;">المورد: {trip.get('supplier', '')} • السائق: {trip.get('driverName', '')}</p>
            <p style="margin: 4px 0 0;">المسار: {trip.get('pickupPoint', '')} → {trip.get('dropoffPoint', '')}</p>
        </div>
        """

    trips_section_html = ""
    if trips_data and trips_entries:
        trips_meta = trips_data if isinstance(trips_data, dict) else {}
        trips_section_html = f"""
        <div class="section">
            <div class="section-title">قسم الرحلات</div>
            <div class="summary">
                إجمالي الرحلات: {trips_meta.get('totalTrips', len(trips_entries))} • المزامنة المعلقة: {trips_meta.get('pendingSync', 0)}
            </div>
            <h3>تفاصيل الرحلات:</h3>
            {html_trips_entries if html_trips_entries else '<p>لا توجد رحلات مسجلة لهذا اليوم.</p>'}
        </div>
        """

    html_template = Template(
        '''
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>Daily Report - $date</title>
        <style>
            @font-face {
                font-family: 'Dubai';
                src: url("$font_regular") format('$font_regular_format');
                font-weight: normal;
                font-style: normal;
            }
            @font-face {
                font-family: 'Dubai';
                src: url("$font_bold") format('$font_bold_format');
                font-weight: bold;
                font-style: normal;
            }
            body {
                font-family: 'Dubai', sans-serif;
                margin: 50px;
                direction: rtl;
                text-align: right;
            }
            h1, h2 {
                color: #105962; /* wathiq-primary */
            }
            .header h1 {
                color: #ffffff;
            }
            .header {
                background-color: #105962; /* wathiq-primary */
                color: white;
                padding: 20px;
                text-align: center;
            }
            .logo {
                width: 140px;
                height: auto;
                display: block;
                margin: 0 auto 10px auto;
            }
            .company-name {
                font-size: 22px;
                font-weight: 700;
                margin-bottom: 6px;
            }
            .section {
                margin-top: 30px;
                border-bottom: 1px solid #D2A736; /* wathiq-accent */
                padding-bottom: 10px;
            }
            .section-title {
                font-size: 20px;
                font-weight: bold;
                color: #105962;
                background-color: #f0f8ff; /* lightBgColor */
                padding: 10px;
                border-radius: 5px;
            }
            .summary {
                background-color: #F8F9FA; /* altRowBgColor */
                padding: 15px;
                border-radius: 5px;
                margin-top: 15px;
                font-size: 1.1em;
            }
            .item {
                margin-bottom: 12px;
                border-bottom: 1px dotted #ddd;
                padding: 6px 0 8px 0;
            }
            .item:last-child {
                border-bottom: none;
            }
            .item-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            .item-title {
                font-weight: bold;
                color: #105962;
                flex: 1;
                min-width: 0;
            }
            .item-meta {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                white-space: nowrap;
            }
            .chip {
                display: inline-block;
                color: #fff;
                padding: 3px 8px;
                border-radius: 6px;
                font-size: 0.85em;
                margin-right: 20px; /* space between chip and amount in RTL renderers */
            }
            .item-amount {
                color: #D2A736; /* wathiq-accent */
                font-weight: 600;
                direction: ltr;
                text-align: left;
                font-variant-numeric: tabular-nums;
                min-width: 80px;
                display: inline-block;
                margin-inline-end: 10px; /* space before the type chip in RTL/LTR */
            }
        </style>
    </head>
    <body>
        <div class="header">
            <img class="logo" src="$logo_path_bytes" alt="Wathiq Logo" />
            <div class="company-name">Wathiq - واثق</div>
            <h1>تقرير واثق اليومي الشامل</h1>
            <p>التاريخ الميلادي: $gregorian_date</p>
            <p>التاريخ الهجري: $hijri_date</p>
        </div>
        
        <div class="section">
            <div class="section-title">القسم المالي</div>
            <div class="summary">
                السيولة الحالية: $current_liquidity
            </div>
            <h3>الإدخالات المالية:</h3>
            $html_entries
        </div>

        <div class="section">
            <div class="section-title">قسم المبيعات</div>
            <div class="summary">
                عدد العملاء المتصل بهم: $customers_contacted
            </div>
            <h3>إدخالات المبيعات:</h3>
            $html_sales_entries
        </div>

        <div class="section">
            <div class="section-title">قسم العمليات</div>
            <h3>إدخالات العمليات:</h3>
            $html_operations_entries
        </div>

        <div class="section">
            <div class="section-title">قسم التسويق</div>
            <h3>مهام التسويق:</h3>
            $html_marketing_tasks
        </div>

        $trips_section

    </body>
    </html>
        '''
    )

    final_html_content = html_template.substitute(
        date=data['date'],
        font_regular=data['font_path_regular'],
        font_bold=data['font_path_bold'],
        font_regular_format=data['font_regular_format'],
        font_bold_format=data['font_bold_format'],
        logo_path_bytes=data.get('logo_path_bytes', ''),
        current_liquidity=finance_data.get('currentLiquidity', '') if isinstance(finance_data, dict) else '',
        customers_contacted=sales_data.get('customersContacted', 0) if isinstance(sales_data, dict) else 0,
        html_entries=html_entries,
        html_sales_entries=html_sales_entries,
        html_operations_entries=html_operations_entries,
        html_marketing_tasks=html_marketing_tasks,
        gregorian_date=data.get('gregorianDateLabel', data['date']),
        hijri_date=data.get('hijriDateLabel', data['date']),
        trips_section=trips_section_html,
    )

    # Create PDF from HTML
    html = HTML(string=final_html_content, base_url=__file__)
    pdf_bytes = html.write_pdf()
    return pdf_bytes

if __name__ == '__main__':
    # The Node.js server will pass the path to a JSON file as a command-line argument
    temp_file_path = sys.argv[1]
    with open(temp_file_path, 'r', encoding='utf-8') as f:
        input_json = f.read()
    input_data = json.loads(input_json)

    # Log versions for debugging
    sys.stderr.write(f"WeasyPrint version: {getattr(weasyprint, '__version__', 'unknown')}\n")
    sys.stderr.write(f"pydyf version: {getattr(pydyf, '__version__', 'unknown')}\n")
    sys.stderr.flush()

    # Clean up the temporary file (optional, as Node.js handles deletion)
    # os.remove(temp_file_path)

    # Resolve fonts and assets
    script_dir = path.dirname(path.abspath(__file__))
    font_dir = path.join(script_dir, 'fonts')
    assets_dir = path.join(script_dir, 'assets')

    # Prefer bundled Dubai fonts if present; otherwise, fall back to system Arabic fonts (Amiri/DejaVu)
    dubai_regular = path.join(font_dir, 'Dubai-Regular.otf')
    dubai_bold = path.join(font_dir, 'Dubai-Bold.ttf')
    if path.exists(dubai_regular) and path.exists(dubai_bold):
        font_path_regular = dubai_regular
        font_path_bold = dubai_bold
    else:
        # Common Debian paths
        amiri_regular = '/usr/share/fonts/truetype/amiri/Amiri-Regular.ttf'
        amiri_bold = '/usr/share/fonts/truetype/amiri/Amiri-Bold.ttf'
        noto_regular = '/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf'
        noto_bold = '/usr/share/fonts/truetype/noto/NotoNaskhArabic-Bold.ttf'
        dejavu_regular = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
        dejavu_bold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
        if path.exists(amiri_regular) and path.exists(amiri_bold):
            font_path_regular = amiri_regular
            font_path_bold = amiri_bold
        elif path.exists(noto_regular) and path.exists(noto_bold):
            font_path_regular = noto_regular
            font_path_bold = noto_bold
        else:
            font_path_regular = dejavu_regular
            font_path_bold = dejavu_bold
    logo_path = path.join(assets_dir, 'logo.png')

    def to_file_uri(p):
        abs_path = path.abspath(p)
        if os.name == 'nt':
            return 'file:///' + abs_path.replace('\\', '/')
        return 'file://' + abs_path

    def font_to_data_uri(font_path: str):
        try:
            if not path.exists(font_path):
                sys.stderr.write(f"ERROR: Font file not found: {font_path}\n")
                sys.stderr.flush()
                raise FileNotFoundError(f"Font file not found: {font_path}")
            mime = 'font/otf' if font_path.lower().endswith('.otf') else 'font/ttf'
            with open(font_path, 'rb') as font_file:
                encoded = base64.b64encode(font_file.read()).decode('utf-8')
            font_format = 'opentype' if mime == 'font/otf' else 'truetype'
            return f'data:{mime};base64,{encoded}', font_format
        except Exception as e:
            sys.stderr.write(f"ERROR: Failed to load font {font_path}: {str(e)}\n")
            sys.stderr.flush()
            raise

    try:
        regular_data_uri, regular_format = font_to_data_uri(font_path_regular)
        bold_data_uri, bold_format = font_to_data_uri(font_path_bold)

        input_data['font_path_regular'] = regular_data_uri
        input_data['font_path_bold'] = bold_data_uri
        input_data['font_regular_format'] = regular_format
        input_data['font_bold_format'] = bold_format
        
        if not path.exists(logo_path):
            sys.stderr.write(f"WARNING: Logo file not found: {logo_path}\n")
            sys.stderr.flush()
            # Use a placeholder or empty string
            input_data['logo_path_bytes'] = ''
        else:
            input_data['logo_path_bytes'] = to_file_uri(logo_path)

        pdf_output = generate_pdf(input_data)

        # Output the PDF bytes directly to stdout
        sys.stdout.buffer.write(pdf_output)
        sys.stdout.buffer.flush()
    except Exception as e:
        sys.stderr.write(f"ERROR: PDF generation failed: {str(e)}\n")
        sys.stderr.write(f"ERROR: Traceback: {type(e).__name__}\n")
        import traceback
        sys.stderr.write(traceback.format_exc())
        sys.stderr.flush()
        sys.exit(1)


