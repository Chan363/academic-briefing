require('dotenv').config();
const EmailSender = require('./src/email-sender');

/**
 * 测试脚本
 * 用于测试邮件配置是否正确
 */
async function testEmail() {
  console.log('='.repeat(60));
  console.log('🧪 测试邮件发送功能');
  console.log('='.repeat(60));

  const emailSender = new EmailSender();

  // 验证连接
  console.log('\n📧 验证SMTP连接...');
  const isConnected = await emailSender.verifyConnection();

  if (!isConnected) {
    console.error('❌ SMTP连接失败，请检查配置');
    return;
  }

  // 发送测试邮件
  console.log('\n📧 发送测试邮件...');
  const result = await emailSender.sendTestEmail();

  if (result.success) {
    console.log('\n✅ 测试邮件发送成功!');
    console.log('   请检查收件箱（可能在垃圾邮件中）');
  } else {
    console.error('\n❌ 测试邮件发送失败:', result.error);
  }
}

// 运行测试
testEmail();
