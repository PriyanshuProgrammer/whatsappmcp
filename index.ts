import express from 'express'
import { Client, LocalAuth } from 'whatsapp-web.js';

const client = new Client({
  puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  authStrategy: new LocalAuth(),
});

const app = express();
app.use(express.json());

const getContacts = async () => {
  const contacts = await client.getContacts()
  return contacts;
}

client.on('qr', async (qr: any) => {
  console.log("QR RECEIVED", qr);
});

client.on('ready', async () => {
  console.log('Client is ready!');
})

app.get('/auth/:phone', async (req, res) => {
  const { phone } = req.params;
  const pairingCode = await client.requestPairingCode(phone);
  res.json({
    pairingCode
  })
})

app.get('/groups', async (req, res) => {
  const contacts = await getContacts();
  res.json({
    groups: contacts.filter((contact) => contact.isGroup)
  })
})

// client.on('message', (msg: any) => {
//   console.log(msg.body)
// });

client.initialize();
app.listen(3000)

