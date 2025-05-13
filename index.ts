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
  const pairingCode = await client.requestPairingCode('919027376251');
  console.info('Pairing code:', pairingCode);
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

app.get('/contact/:name', async (req, res) => {
  const { name } = req.params;
  const contacts = await getContacts();
  res.json({
    contact: contacts.filter((contact) => contact.name?.toLowerCase() === name.toLowerCase())
  })
})

app.get('/send/:id/:message', async (req, res) => {
  const { id, message } = req.params;
  await client.sendMessage(id, message)
  res.json({
    status: 'success'
  })
})

app.get('/getchat/:id/:limit', async (req, res) => {
  const { id, limit } = req.params;
  const chat = await client.getChatById(id);
  const messages = await chat.fetchMessages({ limit: parseInt(limit) });
  res.json({
    messages
  })
})

// client.on('message', (msg: any) => {
//   console.log(msg.body)
// });

client.initialize();
app.listen(3000)

