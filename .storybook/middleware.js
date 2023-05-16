import { queryPinecone } from '../src/langchain';

module.exports = (router) => {
  router.get('/query-pinecone', (req, res) => {
    const { question } = req.query;
    queryPinecone(question).then((result) => {
      res.send(result);
    });
  });
};
