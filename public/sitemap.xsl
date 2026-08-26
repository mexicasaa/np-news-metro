<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>NP News Metro — XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 30px 20px;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          .header {
            background: #0f172a;
            color: #ffffff;
            padding: 24px 30px;
            border-bottom: 3px solid #ba1a1a;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.02em;
          }
          .header p {
            margin: 6px 0 0;
            font-size: 13px;
            color: #94a3b8;
          }
          .stats {
            display: flex;
            gap: 15px;
            padding: 15px 30px;
            background: #f1f5f9;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
          }
          .stats span {
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background: #f8fafc;
            text-align: left;
            padding: 12px 20px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e2e8f0;
          }
          td {
            padding: 12px 20px;
            border-bottom: 1px solid #f1f5f9;
            word-break: break-all;
          }
          tr:hover td {
            background: #f8fafc;
          }
          a {
            color: #ba1a1a;
            text-decoration: none;
            font-weight: 600;
          }
          a:hover {
            text-decoration: underline;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            background: #e2e8f0;
            color: #334155;
          }
          .footer {
            padding: 20px 30px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            background: #fafafa;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NP News Metro — XML Sitemap</h1>
            <p>Generated dynamically for search engine crawlers (Google, Bing, Google News). Structured according to the Sitemaps XML protocol.</p>
          </div>
          <div class="stats">
            <div>Total Indexed URLs: <span><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span></div>
            <div>•</div>
            <div>Canonical Base: <span>https://www.npnewsmetro.com</span></div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 55%;">URL Location</th>
                <th style="width: 15%;">Last Modified</th>
                <th style="width: 15%;">Change Frequency</th>
                <th style="width: 15%;">Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                  <td>
                    <span class="badge"><xsl:value-of select="sitemap:changefreq"/></span>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:priority"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <div class="footer">
            NP News Metro &#169; 2026. All rights reserved. Registered Office: Connaught Place, New Delhi 110001.
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>