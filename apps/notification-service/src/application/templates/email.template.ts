import { AppLinks } from '../../common/constants/urls.contants';

export class EmailTemplates {
  static verificationEmail(name: string, email: string, code: string): string {
    const verifyUrl = `${AppLinks.VERIFY_EMAIL}/${encodeURIComponent(email)}`;

    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Olá, ${name}!</h2>
      <p>Seu código de verificação é:</p>

      <h3 style="color: #2e6c80;">${code}</h3>

      <p>Clique no botão abaixo para validar seu e-mail:</p>

      <a href="${verifyUrl}" 
         style="
           display: inline-block;
           padding: 12px 20px;
           background-color: #2e6c80;
           color: white;
           text-decoration: none;
           border-radius: 6px;
           margin: 15px 0;
         ">
        Validar e-mail
      </a>

      <p>Se você não solicitou este código, ignore esta mensagem.</p>
      <br/>
      <small>Equipe MedSafe</small>
      ${this.footer()}
    </div>
  `;
  }

  static passwordRecovery(name: string, token: string): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Olá, ${name}!</h2>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Use o código abaixo para continuar o processo:</p>
        <h3 style="color: #d9534f;">${token}</h3>
        <p>Se você não solicitou a recuperação de senha, ignore este e-mail.</p>
        <br/>
        <small>Equipe MedSafe</small>
        ${this.footer()}
      </div>
    `;
  }

  static accountCreated(name: string): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Bem-vindo, ${name}!</h2>
        <p>Sua conta foi criada com sucesso no MedSafe.</p>
        <p>Agora você já pode acessar todos os recursos da plataforma.</p>
        <br/>
        <small>Equipe MedSafe</small>
        ${this.footer()}
      </div>
    `;
  }

  static publicDataAccess(name: string, accessedAt: Date): string {
    const formattedDate = accessedAt.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Olá, ${name}!</h2>
        <p>Seus <strong>dados públicos</strong> foram acessados através do QR Code.</p>
        <p><strong>Data e hora do acesso:</strong> ${formattedDate}</p>
        <p>Este aviso é apenas para sua ciência, não é necessária nenhuma ação.</p>
        <br/>
        <small>Equipe MedSafe</small>
        ${this.footer()}
      </div>
    `;
  }

  private static footer(): string {
    return `
      <hr style="margin-top: 30px;"/>
      <p style="font-size: 12px; color: #666;">
        Este é um projeto acadêmico do curso de Análise e Desenvolvimento de Sistemas da PUCRS,
        desenvolvido por João Vitor da Silva Gonçalves. Sem fins lucrativos.
        A empresa MedSafe é fictícia e utilizada apenas para fins educacionais.
      </p>
    `;
  }
}
