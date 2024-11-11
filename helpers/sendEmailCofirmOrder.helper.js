const nodemailer = require('nodemailer');

module.exports.sendEmail = (email, subject, text, order) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: text
  };
  let message = {
    // Comma separated list of recipients
    to: email,

    // Subject of the message
    subject: subject,

    // plaintext body
    text: text,

    // HTML body
    html: `
        <div
          style="font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #fff; margin-top: 50px;">
          <h3
              style="color: #000; text-align: center; margin-bottom: 30px; font-weight: 600; font-size: 24px; padding: 20px; border-top: 1px dotted #ccc; border-bottom: 1px dotted #ccc;">
              BOOKING CỦA QUÝ KHÁCH</h3>
          <!-- --------------------------------------- Phần 1 -------------------------- -->
          <h3 style="color: #c50000; text-transform: uppercase; font-weight: bold; font-size: 16px;">I. Phiếu xác nhận
              booking:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px;">
              <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background-color: #f1f1f1; font-size: 15px;"><strong>Mã
                          đơn hàng:</strong>
                  </td>
                  <td style="padding: 8px; border: 1px solid #ddd; font-size: 15px;">${order.code}</td>
              </tr>
              <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background-color: #f1f1f1; font-size: 15px;"><strong>Tổng
                          tiền:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd; font-size: 15px;">${order.amount.toLocaleString()}</td>
              </tr>
              <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background-color: #f1f1f1; font-size: 15px;"><strong>Ngày
                          đặt:</strong>
                  </td>
                  <td style="padding: 8px; border: 1px solid #ddd; font-size: 15px;">${order.orderDate}</td>
              </tr>
              <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background-color: #f1f1f1; font-size: 15px;"><strong>Trạng
                          thái:</strong>
                  </td>
                  <td style="padding: 8px; border: 1px solid #ddd; font-size: 15px;">${order.status}</td>
              </tr>
              <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; background-color: #f1f1f1; font-size: 15px;"><strong>Nơi
                          tập
                          trung:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd; font-size: 15px;">Cổng trường Đại học Công nghiệp Hà Nội
                  </td>
              </tr>
          </table>

          <p><strong>Ghi chú:</strong> Không bao gồm ăn sáng. Khách ăn sáng tự túc. Tour không hoàn, không hủy, không đổi.
          </p>
          <p><strong>Liên hệ:</strong> Tổng đài tư vấn 0868936041 từ 08:00 - 22:00.</p>
          <!-- ---------------------------------------Hết Phần 1 -------------------------- -->



          <div style="text-align: center; margin-bottom: 20px;">
              <strong style="font-size: 15px;">Cảm ơn Quý Khách đã tin tưởng và sử dụng dịch vụ của chúng tôi!</strong>
          </div>
      </div>

        `,

    // AMP4EMAIL
    amp: `<!doctype html>
                <html ⚡4email>
                <head>
                    <meta charset="utf-8">
                    <style amp4email-boilerplate>body{visibility:hidden}</style>
                    <script async src="https://cdn.ampproject.org/v0.js"></script>
                    <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
                </head>
                <body>
                    <p>Image: <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
                    <p>GIF (requires "amp-anim" script in header):<br/>
                    <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
                </body>
                </html>`

  };

  transporter.sendMail(message, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}