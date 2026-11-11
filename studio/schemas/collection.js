import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Collection name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'Click Generate. Used in links like /shop#christmas.',
      options: {source: 'name', maxLength: 60},
      validation: (r) => r.required(),
    }),
    defineField({name: 'showOnHome', title: 'Feature on the home page', type: 'boolean', initialValue: true}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({name: 'intro2', title: 'Second paragraph', type: 'text', rows: 3}),
    defineField({
      name: 'orderBy',
      title: 'Order-by date',
      type: 'string',
      description: 'e.g. 15 December. When filled in, an "Order by … for Christmas delivery" banner appears.',
    }),
    defineField({name: 'processing', title: 'Making time', type: 'string', description: 'e.g. 3–5 working days'}),
    defineField({name: 'order', title: 'Display order', type: 'number', description: 'Lower numbers show first.', initialValue: 1}),
  ],
  orderings: [{title: 'Display order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name', subtitle: 'orderBy'}, prepare: ({title, subtitle}) => ({title, subtitle: subtitle ? `Order by ${subtitle}` : ''})},
})
