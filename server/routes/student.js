import { authenticateToken } from '../../middleware/authMiddleware.js';
import { getStudentReceipt } from '../../controllers/studentController.js';

// Safe Router Initialization with Express or ESM Fallback
let expressModule = null;
try {
  expressModule = await import('express');
} catch {
  expressModule = null;
}

const createRouter = () => {
  if (expressModule && (expressModule.default?.Router || expressModule.Router)) {
    const Router = expressModule.default?.Router || expressModule.Router;
    const router = Router();
    router.get('/receipt/:batchId', authenticateToken, getStudentReceipt);
    return router;
  }

  // Standalone Router Fallback (when running without Express in dev/test)
  const routes = [];
  const router = (req, res) => {};
  router.get = (path, ...handlers) => {
    routes.push({ method: 'GET', path, handlers });
  };
  router.post = (path, ...handlers) => {
    routes.push({ method: 'POST', path, handlers });
  };
  router.get('/receipt/:batchId', authenticateToken, getStudentReceipt);
  router.stack = routes.map(r => ({
    route: {
      path: r.path,
      stack: r.handlers.map(h => ({ handle: h }))
    }
  }));
  return router;
};

const router = createRouter();

export { getStudentReceipt };
export default router;
