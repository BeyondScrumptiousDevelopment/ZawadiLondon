// Left-hand menu in the Studio: products grouped the way the shop shows them.
export const structure = (S) =>
  S.list()
    .title('Zawadi London')
    .items([
      S.listItem()
        .title('All products')
        .child(S.documentTypeList('product').title('All products').defaultOrdering([{field: 'order', direction: 'asc'}])),
      S.listItem()
        .title('Keepsakes (all year)')
        .child(
          S.documentList()
            .title('Keepsakes')
            .schemaType('product')
            .filter('_type == "product" && !defined(collection)')
            .defaultOrdering([{field: 'order', direction: 'asc'}]),
        ),
      S.listItem()
        .title('Products by collection')
        .child(
          S.documentTypeList('collection')
            .title('Collections')
            .child((id) =>
              S.documentList()
                .title('Products')
                .schemaType('product')
                .filter('_type == "product" && collection._ref == $id')
                .params({id})
                .defaultOrdering([{field: 'order', direction: 'asc'}]),
            ),
        ),
      S.divider(),
      S.documentTypeListItem('collection').title('Collections'),
    ])
