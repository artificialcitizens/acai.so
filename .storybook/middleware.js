import { queryPinecone } from '../src/stories/5-indexes/index-scripts';
import { runCustomAgent } from '../src/stories/6-agents/custom-agent';
import { runMrklAgent } from '../src/stories/6-agents/basic-agent';
import { runChatMrklAgent } from '../src/stories/6-agents/chat-agent';

module.exports = (router) => {
  router.get('/query-pinecone', async (req, res) => {
    const { question } = req.query;
    const resp = await queryPinecone(question);
    res.json(resp);
  });

  router.get('/custom-agent', async (req, res) => {
    const { question } = req.query;
    const resp = await runCustomAgent(question);
    res.json(resp);
  });

  router.get('/mrkl-agent', async (req, res) => {
    const { question } = req.query;
    const resp = await runMrklAgent(question);
    res.json(resp);
  });

  router.get('/chat-mrkl-agent', async (req, res) => {
    const { question } = req.query;
    const resp = await runChatMrklAgent(question);
    res.json(resp);
  });
};
