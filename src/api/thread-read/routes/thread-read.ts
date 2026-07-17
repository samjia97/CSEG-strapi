/**
 * Custom routes for thread-read. Only mark + status are exposed;
 * no default CRUD. Both are content-API routes, so they appear under
 * "Thread-read" in Users & Permissions and must be granted to Authenticated.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/thread-reads/mark/:threadDocumentId',
      handler: 'thread-read.mark',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/thread-reads/status',
      handler: 'thread-read.status',
      config: { policies: [] },
    },
  ],
};
