const AfricasTalking = require('africastalking');

const AT = AfricasTalking({
  username: process.env.AT_USERNAME,
  apiKey:   process.env.AT_API_KEY,
});

module.exports = {
  sms:  AT.SMS,
  ussd: AT.USSD,
};
