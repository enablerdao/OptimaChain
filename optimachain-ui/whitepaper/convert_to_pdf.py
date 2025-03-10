import markdown
import pdfkit
import os

# Markdownファイルを読み込む
with open('OptimaChain_Whitepaper.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# MarkdownをHTMLに変換
html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

# スタイルを追加
styled_html = f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OptimaChain ホワイトペーパー</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {{
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2em;
            background-color: #fff;
        }}
        
        h1, h2, h3, h4, h5, h6 {{
            color: #0071e3;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
        }}
        
        h1 {{
            font-size: 2.5em;
            text-align: center;
            margin-bottom: 1em;
            color: #0062c3;
            border-bottom: 2px solid #0071e3;
            padding-bottom: 0.5em;
        }}
        
        h2 {{
            font-size: 1.8em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 0.3em;
        }}
        
        h3 {{
            font-size: 1.4em;
        }}
        
        h4 {{
            font-size: 1.2em;
        }}
        
        p {{
            margin-bottom: 1em;
        }}
        
        code {{
            background-color: #f6f8fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.9em;
        }}
        
        pre {{
            background-color: #f6f8fa;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
        }}
        
        pre code {{
            background-color: transparent;
            padding: 0;
        }}
        
        blockquote {{
            border-left: 4px solid #0071e3;
            padding-left: 1em;
            color: #666;
            margin-left: 0;
        }}
        
        table {{
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1em;
        }}
        
        table, th, td {{
            border: 1px solid #ddd;
        }}
        
        th, td {{
            padding: 0.5em;
            text-align: left;
        }}
        
        th {{
            background-color: #f6f8fa;
        }}
        
        a {{
            color: #0071e3;
            text-decoration: none;
        }}
        
        a:hover {{
            text-decoration: underline;
        }}
        
        img {{
            max-width: 100%;
            height: auto;
        }}
        
        .cover {{
            text-align: center;
            margin-bottom: 3em;
        }}
        
        .cover h1 {{
            font-size: 3em;
            margin-bottom: 0.2em;
            border: none;
        }}
        
        .cover p {{
            font-size: 1.2em;
            color: #666;
            margin-bottom: 2em;
        }}
        
        .version {{
            font-style: italic;
            color: #666;
            margin-bottom: 2em;
        }}
        
        .toc {{
            background-color: #f6f8fa;
            padding: 1em 2em;
            border-radius: 5px;
            margin-bottom: 2em;
        }}
        
        .toc h2 {{
            margin-top: 0;
        }}
        
        .toc ul {{
            padding-left: 1.5em;
        }}
        
        .toc li {{
            margin-bottom: 0.5em;
        }}
        
        .footnote {{
            font-size: 0.9em;
            color: #666;
            border-top: 1px solid #eaecef;
            padding-top: 1em;
            margin-top: 2em;
        }}
    </style>
</head>
<body>
    <div class="cover">
        <h1>OptimaChain ホワイトペーパー</h1>
        <p><strong>革新的なスケーリング技術と高度なセキュリティを統合した次世代型分散型ブロックチェーンプラットフォーム</strong></p>
        <p class="version">バージョン 1.0.0</p>
    </div>
    
    {html_content}
    
    <div class="footnote">
        <p>© 2023 OptimaChain. All rights reserved.</p>
    </div>
</body>
</html>
'''

# HTMLファイルとして保存
with open('OptimaChain_Whitepaper.html', 'w', encoding='utf-8') as f:
    f.write(styled_html)

print("HTML version created: OptimaChain_Whitepaper.html")

try:
    # HTMLをPDFに変換
    pdfkit_options = {
        'page-size': 'A4',
        'margin-top': '20mm',
        'margin-right': '20mm',
        'margin-bottom': '20mm',
        'margin-left': '20mm',
        'encoding': 'UTF-8',
        'no-outline': None,
        'enable-local-file-access': None
    }
    
    pdfkit.from_file('OptimaChain_Whitepaper.html', 'OptimaChain_Whitepaper.pdf', options=pdfkit_options)
    print("PDF version created: OptimaChain_Whitepaper.pdf")
except Exception as e:
    print(f"Could not create PDF: {e}")
    print("Please install wkhtmltopdf or use the HTML version.")