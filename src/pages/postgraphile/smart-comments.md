---
layout: page
path: /postgraphile/smart-comments/
title: Smart Comments
---

## Smart Comments

You can customise your PostGraphile GraphQL schema by adding comments to tables, columns, functions, relations, etc. within your PostgreSQL database. These changes could be renaming something (via `@name newNameHere`), or omitting things from your GraphQL schema (via `@omit`), or anything else a plugin supports!

We call this functionality "Smart Comments" and it allows you to easily customise the generated GraphQL schema without making breaking changes to your database.

If you're using PostGraphile in `--watch` mode, you should be able to see in PostGraphile's GraphiQL client that the related types and fields will reflect the change almost immediately. If you're not using `--watch` then you may need to restart the server for smart comment changes to take effect.

### Table of Contents

- [Smart comment spec](#smart-comment-spec)
- [Deprecating](#deprecating)
- [Renaming](#renaming)
- [Adding fake constraints](#constraints) (e.g. on views/custom types)
- [Omitting](#omitting)
- [Simple collections](#simple-collections)
- [Composite types as function arguments](#composite-types-as-function-arguments)

### Smart comment spec

Comments can be added to various entities within PostgreSQL; we add a special syntax to these comments that enables PostGraphile to treat them as smart comments.

A smart comment is made up of one or more "tags" and optionally followed by the remaining comment. Tags may have a string payload (which follows a the tag and a space, and must not contain newline characters) and are separated by newlines. Tags always start with an `@` symbol and must always come before the remaining comment, hence all smart comments start with an `@` symbol. If a tag has no payload then its value will be the boolean `true`, otherwise it will be a string. If the same tag is present more than once in a smart comment then its final value will become an array of the individual values for that tag.

The following text could be parsed as a smart comment (**the smart comment values shown are examples only, and don't have any meaning**):

```
@name meta
@isImportant
@jsonField date timestamp
@jsonField name text
@jsonField episode enum ONE=1 TWO=2
This field has a load of arbitrary tags.
```

and would result in the following JSON tags object:

```json
{
  "name": "meta",
  "isImportant": true,
  "jsonField": ["date timestamp", "name text", "episode enum ONE=1 TWO=2"]
}
```

and the description on the last line would be made available as documentation as non-smart comments are.

```
This field has a load of arbitrary tags.
```

To put newlines in smart comments we recommend the use of the [`E` "escape" string constants](https://www.postgresql.org/docs/10/static/sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS), wherein you can use `\n` for newlines. For example the text above could be added to a comment on a field via:

```sql
comment on column my_schema.my_table.my_column is
  E'@name meta\n@isImportant\n@jsonField date timestamp\n@jsonField name text\n@jsonField episode enum ONE=1 TWO=2\nThis field has a load of arbitrary tags.';
```

There are a few smart comment tags built into PostGraphile, but support for more can be added via plugins.

Note that the parser is deliberately very strict currently, we might make it more flexible in future; you might want to check out the [test suite](https://github.com/graphile/graphile-engine/blob/master/packages/graphile-build-pg/__tests__/tags.test.js).

### Deprecating

You can deprecate a database column using the `@deprecated` tag. If you need multiple lines, you can specify the tag multiple times, one per line of output text.

```sql
comment on column my_schema.my_table.my_column is
  E'@deprecated Use myOtherColumn instead.';
```

### Renaming

You can add a smart comment to an entity to rename that entity. For tables, columns, custom types and many functions you can use the `@name` tag followed by the new name. For more complex things we use different tags, such as for foreign key constraints we have `@fieldName` and `@foreignFieldName`.

The following can be renamed:

#### Tables

```sql
comment on table post is
  E'@name message';
```

#### Columns

```sql
comment on column my_table.my_column is
  E'@name alternativeColumnName';
```

#### Relations

```sql
comment on constraint thread_author_id_fkey on thread is
  E'@foreignFieldName threads\n@fieldName author';
```

#### Unique-key record finders

```sql
comment on constraint person_pkey on person is
  E'@fieldName findPersonById';
```

#### Computed columns

```sql
comment on function person_full_name(person) is
  E'@fieldName name';
```

#### Custom queries

```sql
comment on function search_posts(text) is
  E'@name returnPostsMatching';
```

#### Custom mutations

```sql
comment on function authenticate(text, text) is
  E'@name login';
```

#### Custom mutation function result names

```sql
comment on function removeSomething(text) is
  E'@resultFieldName success';
comment on function authenticate(text, text) is
  E'@resultFieldName token\n@name login';
```

#### Types

```sql
comment on type flibble is
  E'@name flamble';
```

### Constraints

You can add "fake" constraints to types in PostgreSQL using smart comments.
The primary use case for this is to make views act more table-like - allowing
you to express the connections between tables and views. It's also useful
on composite types.

#### Not Null

To mark a column as not null:

```sql
comment on column my_view.my_column is E'@notNull`;
```

#### Primary Key

Primary key columns will automatically be marked as `@notNull`, as they would in PostgreSQL.

If you declare something as a primary key it _must_ be unique. We do not check it's unique - we trust you - but if it isn't unique then we're not sure what will happen...

```sql
comment on view my_view is E'@primaryKey id';
-- or
comment on view my_view is E'@primaryKey type, identifier';
```

#### Foreign Key

The foreign key adds a fake constraint pretending to be a foreign key. It has
the following syntax which mirrors the PostgreSQL foreign key constraint:

`@foreignKey (col1, ...) references [my_schema.]my_table [(col1, ...)]`

The schema is optional if the target table is in the same schema. If you're
referencing a Primary Key on the remote table/view then you can skip the final
column specification should you wish. Otherwise, you must reference columns
matching a unique constraint.

This constraint applies to tables, views, materialised views and (in one
direction only) to composite types.

```sql
comment on view my_view is E'@foreignKey (post_id) references post_view';
-- or
comment on view my_view is E'@foreignKey (post_id) references post_view (id)';
-- or
comment on materialized view my_materialized_view is E'@foreignKey (post_id) references posts (id)';
-- or
comment on materialized view my_materialized_view is E'@foreignKey (key_1, key_2) references other_table (key_1, key_2)';
-- or
comment on type my_composite_type is E'@foreignKey (my_table_id) references my_table';
```

#### Example

Here is a basic table, with the name changed from `original_table` to `renamed_table`:

```sql
create table original_table (
  col1 int
);

comment on table original_table is E'@name renamed_table';
```

The column can also be renamed:

```sql
comment on column original_table.col1 is E'@name colA';
```

The same can be done for types and custom queries:

```sql
create type flibble as (f text);

create function getFlamble() returns SETOF flibble as $$
    select (body)::flibble from post
$$ language sql;

comment on type flibble is E'@name flamble';
comment on function getFlamble() is E'@name allFlambles';
```

Smart comments are also reflected in GraphiQL. Here, we are querying the table `original_table` by looking at `allOriginalTables`:

<div class="full-width">

![GraphiQL displaying allOriginalTables](./smart-comments-rename-example1.png)

</div>

Next, we add the smart comment `E'@name renamed_table'` on `original_table` and the rename is instantly reflected in GraphiQL:

<div class="full-width">

![GraphiQL displaying the renamed allOriginalTables](./smart-comments-rename-example2.png)

</div>

So now the query needs to use the new name for the table:

<div class="full-width">

![GraphiQL displaying allRenamedTables](./smart-comments-rename-example3.png)

</div>

### Omitting

To remove an entity from your API, create a comment on the entity in question and use `@omit`. If you only want to omit the entity from certain operations you can list them. For example, `@omit update` on a table would prevent the table from having an update-related functionality whilst still including queries, create and delete. `@omit update` on a column would prevent the column appearing in the `Patch` type, so it cannot be updated (but can still be created) via GraphQL.

Here's a quick-reference for the operations we currently support (you'll want to experiment with them as there wasn't space to put all the caveats in the table!):

<div class='big-table'>

| ⁣   | Action        | Table effect            | Column effect         | Function effect      |
| --- | ------------- | ----------------------- | --------------------- | -------------------- |
| C   | **`create`**  | omit `create` mutation  | omit from `create`    | -                    |
| R   | **`read`**    | omit completely         | completely omitted    | -                    |
| U   | **`update`**  | omit `update` mutations | omit from `update`    | -                    |
| D   | **`delete`**  | omit `delete` mutations | -                     | -                    |
| F   | **`filter`**  | omit `condition` arg    | omit from `condition` | no filtering         |
| O   | **`order`**   | omit `orderBy` arg      | omit from `orderBy`   | no ordering          |
| A   | **`all`**     | no `allFoos` query      | -                     | -                    |
| M   | **`many`**    | no foreign key fields   | -                     | -                    |
| X   | **`execute`** | -                       | -                     | function not present |

</div>

> **Warning:** This functionality is not intended for implementing permissions, it's for removing things from your API that you don't need. You should back these up with database permissions if needed.

#### Unique-key record finders

To exclude Unique-key record finders (_e.g._ `photoByUrl` or `personById`) from
the root Query type of your GraphQL schema, add an `@omit` comment on the
constraint:

```sql
comment on constraint person_pkey on person is
  E'@omit';
```

#### Usage

Add a comment on your entity with the following format:

```sql
comment on table table_name is E'@omit <actions>';
```

Multiple actions can be listed using commas (no spaces!), as in the following example which disables mutations on a table:

```sql
comment on table table_name is E'@omit create,update,delete';
```

#### Example

On a simple table called `book` we have added a smart comment omitting the `update` and `delete` operations:

```sql
create table forum_example.book (
  col1 int
);

comment on table forum_example.book is E'@omit update,delete';
```

The results are immediately reflected in GraphiQL. We can also disable `create` operations:

```sql
comment on table forum_example.book is E'@omit create,update,delete';
```

On the left, you can see the documentation for all the fields and types regarding `book` before the `create` operation was omitted. On the right, you can see the reduced fields and types once the `create` operation is omitted.

![GraphiQL displaying an omit smart comment example](./smart-comments-omit-example.png)

### Simple collections

You can control whether simple collections are enabled by default using
`--simple-collections omit|both|only` (or `simpleCollections: "omit"|"both"|"only"`); however sometimes you want to override this on a case
by case setting - for example if you want relay connections for almost all
collections, except when it comes to a user's email addresses where you want to
use a simple list.

You can do this with the `@simpleCollections omit`, `@simpleCollections both`
and `@simpleCollections only` smart comments.

This applies to tables, relations and functions (both custom queries and computed columns):

```sql
comment on table email is
  E'@simpleCollections both';
```

```sql
comment on constraint email_user_id_fkey on email is
  E'@simpleCollections both';
```

```sql
comment on function search_people(query text) is
  E'@simpleCollections both';
```

### Composite types as function arguments

When building a custom mutation, you probably want to use the composite type that is generated when creating a table in PostgreSQL as a function argument, like this (note this is just an example for illustrative purposes):

```sql
create table example(
  id uuid primary key,
  name text not null
);

create function new_example(input example) returns example as $$
  insert into example (id, name) values (input.id, input.name) returning *;
$$ language sql volatile;
```

By default, composite types will be translated into a GraphQL types by PostGraphile with the same characteristics, i.e. all `not null` columns will become non-nullable fields. You can let PostGraphile know that you want to convert the composite type into another "variant" GraphQL type with a smart comment. Variants include `patch` (which is equivalent to the argument to `update*` mutations) and `base` (which makes every column both available (ignores permissions) and nullable). For example:

```sql
create table example(
  id uuid primary key,
  name text not null
);

create function new_example_with_auto_id(input example) returns example as $$
  insert into example (id, name) values (gen_random_uuid(), input.name) returning *;
$$ language sql volatile;

comment on function new_example_with_auto_id(input example) is
  E'@arg0variant patch';
```

This uses the `patch` variant from PostGraphile's update mutations which has all the fields except `id`. This will mean that the custom mutation will not ask for the `id` on the client-side anymore (because it will generate it itself). Note how `arg0` refers to the first function parameter (we use a 0-indexed counter of the arguments), thus `arg2` would be the third parameter.
