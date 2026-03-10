const nodemailer = require('nodemailer');
const fs = require('fs');

/**
 * 邮件发送器
 * 使用免费的邮件服务发送学术简报
 */
class EmailSender {
  constructor() {
    this.config = this.loadConfig();
    this.transporter = this.createTransporter();
  }

  /**
   * 加载配置
   */
  loadConfig() {
    return {
      from: process.env.EMAIL_FROM || 'academic-briefing@no-reply.com',
      to: process.env.EMAIL_TO || '1192634650@qq.com',
      smtp: {
        host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_SMTP_USER,
          pass: process.env.EMAIL_SMTP_PASS
        }
      }
    };
  }

  /**
   * 创建邮件传输器
   */
  createTransporter() {
    // 支持多种邮件服务
    const host = this.config.smtp.host.toLowerCase();

    if (host.includes('gmail')) {
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: this.config.smtp.auth.user,
          pass: this.config.smtp.auth.pass
        }
      });
    } else if (host.includes('qq')) {
      return nodemailer.createTransport({
        host: 'smtp.qq.com',
        port: 587,
        secure: false,
        auth: {
          user: this.config.smtp.auth.user,
          pass: this.config.smtp.auth.pass
        }
      });
    } else if (host.includes('163')) {
      return nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true,
        auth: {
          user: this.config.smtp.auth.user,
          pass: this.config.smtp.auth.pass
        }
      });
    } else {
      // 默认使用用户配置
      return nodemailer.createTransport(this.config.smtp);
    }
  }

  /**
   * 发送学术简报邮件
   */
  async sendBriefing(htmlContent, articleCount) {
    const date = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = `${yesterday.getFullYear()}年${yesterday.getMonth() + 1}月${yesterday.getDate()}日`;

    const subject = articleCount > 0
      ? `📚 UTD24期刊学术简报 - ${dateStr} (${articleCount}篇新文献)`
      : `📚 UTD24期刊学术简报 - ${dateStr}`;

    const mailOptions = {
      from: this.config.from,
      to: this.config.to,
      subject: subject,
      html: htmlContent,
      text: articleCount > 0
        ? `UTD24期刊学术简报 - ${dateStr}\n\n本次简报共收录 ${articleCount} 篇实证研究文献。`
        : `UTD24期刊学术简报 - ${dateStr}\n\n今日无新发表的实证研究文献。`
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
      console.log('Message ID:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 验证邮件配置
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('SMTP server connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }

  /**
   * 发送测试邮件
   */
  async sendTestEmail() {
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>测试邮件</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>📧 测试邮件</h2>
        <p>如果您收到这封邮件，说明邮件配置正确！</p>
        <p>学术简报系统已准备就绪，将在每天早上8点自动发送。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">发送时间: ${new Date().toLocaleString('zh-CN')}</p>
      </body>
      </html>
    `;

    const mailOptions = {
      from: this.config.from,
      to: this.config.to,
      subject: '✅ 学术简报系统测试邮件',
      html: testHtml
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent successfully!');
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending test email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailSender;
