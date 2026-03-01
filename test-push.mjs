import handler from './api/send-push.js';
import dotenv from 'dotenv';
dotenv.config();

const req = {
    method: 'POST',
    body: {
        title: 'Test',
        body: 'Testing push'
    }
};

const res = {
    setHeader: () => {},
    status: (code) => {
        console.log('Status code:', code);
        return {
            json: (data) => console.log('Response JSON:', data),
            end: () => console.log('Response End')
        }
    }
};

handler(req, res);
