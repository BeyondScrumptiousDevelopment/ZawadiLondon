import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    {name: 'basics', title: 'Basics', default: true},
    {name: 'photos', title: 'Photos & video'},
    {name: 'details', title: 'Details'},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({name: 'name', title: 'Product name', type: 'string', group: 'basics', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'basics',
      description: 'Click Generate. The product page will be /product?p=this-name.',
      options: {source: 'name', maxLength: 80},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      group: 'basics',
      to: [{type: 'collection'}],
      description: 'e.g. The Christmas Collection. Leave empty for all-year keepsakes.',
    }),
    defineField({name: 'tagline', title: 'One-line description', type: 'string', group: 'basics'}),
    defineField({
      name: 'price',
      title: 'Price (£)',
      type: 'number',
      group: 'basics',
      description: 'Leave empty to show the price note instead.',
      validation: (r) => r.min(0),
    }),
    defineField({name: 'priceNote', title: 'Price note', type: 'string', group: 'basics', description: 'e.g. "From £35" or "Price on request"'}),
    defineField({name: 'etsyUrl', title: 'Etsy link', type: 'url', group: 'basics', initialValue: 'https://zawadilondon.etsy.com'}),

    defineField({name: 'image', title: 'Main photo', type: 'image', group: 'photos', options: {hotspot: true}}),
    defineField({
      name: 'gallery',
      title: 'More photos',
      type: 'array',
      group: 'photos',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
    }),
    defineField({name: 'videoFile', title: 'Video (MP4)', type: 'file', group: 'photos', options: {accept: 'video/mp4'}}),

    defineField({name: 'description', title: 'Description', type: 'text', rows: 5, group: 'details'}),
    defineField({name: 'details', title: 'Details (one point each)', type: 'array', group: 'details', of: [{type: 'string'}]}),
    defineField({name: 'size', title: 'Size', type: 'string', group: 'details', description: 'e.g. 6.9cm'}),
    defineField({name: 'nameLimit', title: 'Name limit', type: 'string', group: 'details', description: 'e.g. 10 characters'}),
    defineField({name: 'postage', title: 'Postage', type: 'string', group: 'details', description: 'e.g. £3.65 small parcel'}),
    defineField({name: 'personalisationNote', title: 'Personalisation instructions', type: 'text', rows: 3, group: 'details'}),
    defineField({name: 'perfectFor', title: 'Perfect for', type: 'array', group: 'details', of: [{type: 'string'}], options: {layout: 'tags'}}),
    defineField({name: 'personalise', title: 'You choose', type: 'array', group: 'details', of: [{type: 'string'}], options: {layout: 'tags'}}),
    defineField({
      name: 'options',
      title: 'Options',
      type: 'array',
      group: 'details',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'option',
          fields: [
            defineField({name: 'name', title: 'Option name', type: 'string', description: 'e.g. Frame'}),
            defineField({name: 'choices', title: 'Choices', type: 'array', of: [{type: 'string'}], options: {layout: 'tags'}}),
          ],
          preview: {select: {title: 'name', choices: 'choices'}, prepare: ({title, choices}) => ({title, subtitle: (choices || []).join(' · ')})},
        }),
      ],
    }),

    defineField({name: 'available', title: 'Show on the website', type: 'boolean', group: 'settings', initialValue: true}),
    defineField({name: 'featured', title: 'Show on the home page', type: 'boolean', group: 'settings', initialValue: false}),
    defineField({name: 'designer', title: 'Show the live "Picture yours" frame preview', type: 'boolean', group: 'settings', initialValue: false}),
    defineField({name: 'order', title: 'Display order', type: 'number', group: 'settings', description: 'Lower numbers show first.', initialValue: 100}),
  ],
  orderings: [{title: 'Display order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', price: 'price', note: 'priceNote', media: 'image', hidden: 'available', col: 'collection.name'},
    prepare: ({title, price, note, media, hidden, col}) => ({
      title,
      media,
      subtitle: [typeof price === 'number' ? `£${price}` : note, col, hidden === false ? 'Hidden' : ''].filter(Boolean).join(' · '),
    }),
  },
})
