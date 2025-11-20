const axios = require('axios');
const querystring = require('querystring');
module.exports = {
    smsOTp:async(mobile,otp) => {
        const number = mobile;
        const key = `56661ADC561B64`; 
        const senderid = 'SPTSMS';
        const message = `Your otp is ${otp} SELECTIAL`;

        const data = {
            key: key,
            campaign: 0,
            routeid: 9,  // Double-check this route ID
            type: 'text',
            contacts: number,
            senderid: senderid,
            msg: message,
            template_id: '1707166619134631839'  // Verify this template ID
        };

       

        const queryString = querystring.stringify(data);
        const url = `http://msg.pwasms.com/app/smsapi/index.php?${queryString}`;
        
        try {
            const response = await axios.get(url);
            console.log('sms response :::', response.data);  // Log the full response
            if (response.data) {
                return 'success';
            } else {
                return 'failed';
            }
        } catch (error) {
            console.error('Error sending SMS:', error);  // Log the error
            return 'failed';
        }
    }
}