export function generateNewUserEmailTemplate(email: string, tempPassword: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao Formula Pilates</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .credentials-box {
            background: white;
            border: 2px solid #dc2626;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .password {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            background: #fef2f2;
            padding: 10px;
            border-radius: 4px;
            letter-spacing: 1px;
          }
          .warning {
            background: #fef3cd;
            border: 1px solid #fbbf24;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏃‍♀️ Bem-vindo ao Formula Pilates!</h1>
          <p>Sua conta foi criada com sucesso</p>
        </div>
        
        <div class="content">
          <h2>Olá!</h2>
          <p>Uma conta foi criada para você no sistema Formula Pilates. Agora você pode registrar suas horas de trabalho e acompanhar seus ganhos.</p>
          
          <div class="credentials-box">
            <h3>Suas credenciais de acesso:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Senha temporária:</strong></p>
            <div class="password">${tempPassword}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Por segurança, você será solicitado a alterar sua senha no primeiro login. Mantenha suas credenciais seguras e não compartilhe com terceiros.
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000'}/login" class="button">
              Fazer Login Agora
            </a>
          </div>
          
          <h3>Como usar o sistema:</h3>
          <ul>
            <li>📅 Registre suas horas de trabalho diariamente</li>
            <li>💰 Acompanhe seus ganhos mensais</li>
            <li>📊 Visualize relatórios detalhados</li>
            <li>🔒 Altere sua senha na primeira vez que fizer login</li>
          </ul>
          
          <p>Se você tiver alguma dúvida ou precisar de ajuda, entre em contato com o administrador do sistema.</p>
        </div>
        
        <div class="footer">
          <p>Este email foi enviado automaticamente pelo sistema Formula Pilates.</p>
          <p>© ${new Date().getFullYear()} Formula Pilates. Todos os direitos reservados.</p>
        </div>
      </body>
    </html>
  `

  const text = `
Bem-vindo ao Formula Pilates!

Sua conta foi criada com sucesso. Agora você pode registrar suas horas de trabalho e acompanhar seus ganhos.

Suas credenciais de acesso:
Email: ${email}
Senha temporária: ${tempPassword}

IMPORTANTE: Por segurança, você será solicitado a alterar sua senha no primeiro login.

Acesse o sistema em: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000'}/login

Como usar o sistema:
- Registre suas horas de trabalho diariamente
- Acompanhe seus ganhos mensais
- Visualize relatórios detalhados
- Altere sua senha na primeira vez que fizer login

Se você tiver alguma dúvida, entre em contato com o administrador do sistema.

© ${new Date().getFullYear()} Formula Pilates. Todos os direitos reservados.
  `

  return { html, text }
}
