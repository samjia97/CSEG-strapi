# forum-plugin

Adds a **Forum** link to the Strapi admin left navigation, pointing at the
`forum-thread` collection type via the shared `custom-content-manager3` view.

Cloned from `news-plugin` — the only differences are the plugin id, the menu
label, and the `to` target (`api::forum-thread.forum-thread`).
