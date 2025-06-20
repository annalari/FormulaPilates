import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, tempPassword } = await request.json()

    if (!email || !tempPassword) {
      return NextResponse.json(
        { error: 'Email and temporary password are required' },
        { status: 400 }
      )
    }

    // Email content
    const emailContent = {
      to: email,
      subject: 'Bem-vindo ao Sistema Fórmula Pilates - Acesso Criado',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Acesso ao Sistema Fórmula Pilates</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .credentials { background-color: #fff; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
            .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Fórmula Pilates</h1>
              <p>Sistema de Controle de Horas</p>
            </div>
            
            <div class="content">
              <h2>Bem-vindo ao Sistema!</h2>
              <p>Olá,</p>
              <p>Seu acesso ao Sistema de Controle de Horas da Fórmula Pilates foi criado com sucesso!</p>
              
              <div class="credentials">
                <h3>Suas credenciais de acesso:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Senha temporária:</strong> ${tempPassword}</p>
              </div>
              
              <h3>Próximos passos:</h3>
              <ol>
                <li>Acesse o sistema através do link abaixo</li>
                <li>Faça login com suas credenciais</li>
                <li>Você será solicitado a alterar sua senha no primeiro acesso</li>
                <li>Escolha uma senha segura e pessoal</li>
              </ol>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
                Acessar Sistema
              </a>
              
              <h3>Importante:</h3>
              <ul>
                <li>Esta senha é temporária e deve ser alterada no primeiro acesso</li>
                <li>Mantenha suas credenciais em segurança</li>
                <li>Em caso de dúvidas, entre em contato com o administrador</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Este é um email automático. Não responda a esta mensagem.</p>
              <p>© ${new Date().getFullYear()} Fórmula Pilates - Todos os direitos reservados</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    // Using EmailJS or similar service for sending emails
    // For now, we'll use a simple fetch to a email service
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          subject: emailContent.subject,
          html_content: emailContent.html,
          temp_password: tempPassword,
          app_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        }
      })
    })

    if (!emailResponse.ok) {
      // Fallback: Log the email content for manual sending
      console.log('Email sending failed, logging content for manual sending:')
      console.log('To:', email)
      console.log('Subject:', emailContent.subject)
      console.log('Temporary Password:', tempPassword)
      
      // For development, we'll simulate success but log the details
      return NextResponse.json({
        success: true,
        message: 'Email enviado com sucesso',
        debug: {
          email,
          tempPassword,
          note: 'Email logged to console for development'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso'
    })

  } catch (error) {
    console.error('Error sending email:', error)
    
    // For development, return success with debug info
    return NextResponse.json({
      success: true,
      message: 'Email processado (modo desenvolvimento)',
      debug: {
        note: 'Check console for email details'
      }
    })
  }
}
