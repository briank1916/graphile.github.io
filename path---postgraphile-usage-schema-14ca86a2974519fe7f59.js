webpackJsonp([0xf77167642f30],{403:function(e,n){e.exports={data:{remark:{html:'<h2 id="usage---schema-only"><a href="#usage---schema-only" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>Usage - Schema Only</h2>\n<p>The PostGraphile middleware gives you a lot of excellent features for running\nyour own GraphQL server. However, if you want to execute a PostGraphile query\nin Node.js without having to go through HTTP you can use some other exported\nfunctions that PostGraphile provides.</p>\n<p>The first function you will need is <code>createPostGraphileSchema</code> (or\n<code>watchPostGraphileSchema</code> if you want to get a new schema each time the\ndatabase is updated) which creates your PostGraphile GraphQL schema by\nintrospecting your database.</p>\n<p>The function takes very similar arguments to <a href="/postgraphile/usage-library/">the <code>postgraphile</code>\nmiddleware</a>.</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token function">createPostGraphileSchema</span><span class="token punctuation">(</span>\n  process<span class="token punctuation">.</span>env<span class="token punctuation">.</span>DATABASE_URL <span class="token operator">||</span> <span class="token string">\'postgres://localhost/\'</span>\n<span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>schema <span class="token operator">=></span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token keyword">catch</span><span class="token punctuation">(</span>error <span class="token operator">=></span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\n</code></pre>\n      </div>\n<p>Now that you have your schema, in order to execute a GraphQL query you must\nsupply an (authenticated) <code>pgClient</code> on the context object. The preferred way\nto do this is via the asynchronous <code>withPostGraphileContext</code> function. The\ncontext object will contain a PostgreSQL client which has its own transaction\nwith the correct permission levels for the associated user.</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">const</span> <span class="token punctuation">{</span> Pool <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'pg\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token keyword">const</span> <span class="token punctuation">{</span> graphql <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'graphql\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token keyword">const</span> <span class="token punctuation">{</span> withPostGraphileContext <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'postgraphile\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token keyword">const</span> myPgPool <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Pool</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token keyword">export</span> <span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">performQuery</span><span class="token punctuation">(</span>\n  schema<span class="token punctuation">,</span>\n  query<span class="token punctuation">,</span>\n  variables<span class="token punctuation">,</span>\n  jwtToken<span class="token punctuation">,</span>\n  operationName\n<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token keyword">await</span> <span class="token function">withPostGraphileContext</span><span class="token punctuation">(</span>\n    <span class="token punctuation">{</span>\n      pgPool<span class="token punctuation">:</span> myPgPool<span class="token punctuation">,</span>\n      jwtToken<span class="token punctuation">:</span> jwtToken<span class="token punctuation">,</span>\n      jwtSecret<span class="token punctuation">:</span> <span class="token string">"..."</span><span class="token punctuation">,</span>\n      pgDefaultRole<span class="token punctuation">:</span> <span class="token string">"..."</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    <span class="token keyword">async</span> context <span class="token operator">=></span> <span class="token punctuation">{</span>\n      <span class="token comment">// Execute your GraphQL query in this function with the provided</span>\n      <span class="token comment">// `context` object, which should NOT be used outside of this</span>\n      <span class="token comment">// function.</span>\n      <span class="token keyword">return</span> <span class="token keyword">await</span> <span class="token function">graphql</span><span class="token punctuation">(</span>\n        schema<span class="token punctuation">,</span> <span class="token comment">// The schema from `createPostGraphileSchema`</span>\n        query<span class="token punctuation">,</span>\n        <span class="token keyword">null</span><span class="token punctuation">,</span>\n        <span class="token punctuation">{</span> <span class="token operator">...</span>context <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token comment">// You can add more to context if you like</span>\n        variables<span class="token punctuation">,</span>\n        operationName\n      <span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>\n<p>(The <code>await</code> keywords after the <code>return</code> statements aren\'t required, they\'re just there to clarify the results are promises.)</p>\n<h4 id="api-createpostgraphileschemapgconfig-schemaname-options"><a href="#api-createpostgraphileschemapgconfig-schemaname-options" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>API: <code>createPostGraphileSchema(pgConfig, schemaName, options)</code></h4>\n<p>This function takes three arguments (all are optional) and returns a promise to a GraphQLSchema object.</p>\n<p>The returned GraphQLSchema will <strong>not</strong> be updated when your database changes - if you require "watch" functionality, please use <code>watchPostGraphileSchema</code> instead (see below).</p>\n<ul>\n<li><strong><code>pgConfig</code></strong>: An object or string that will be passed to the <a href=""><code>pg</code></a> library and used to connect to a PostgreSQL backend. If you already have a client or pool instance, when using this function you may also pass a <code>pg</code> client or a <code>pg-pool</code> instance directly instead of a config.</li>\n<li><strong><code>schemaName</code></strong>: A string which specifies the PostgreSQL schema that PostGraphile will use to create a GraphQL schema. The default schema is the <code>public</code> schema. May be an array for multiple schemas. For users who want to run the Postgres introspection query ahead of time, you may also pass in a <code>PgCatalog</code> instance directly.</li>\n<li>\n<p><strong><code>options</code></strong>: An object containing other miscellaneous options. Most options are shared with the <code>postgraphile</code> middleware function. Options could be: <!-- SCHEMA_DOCBLOCK_BEGIN --></p>\n<ul>\n<li><code>pgDefaultRole</code>: The default Postgres role to use. If no role was provided in a provided JWT token, this role will be used.</li>\n<li><code>dynamicJson</code>: Setting this to <code>true</code> enables dynamic JSON which will allow you to use any JSON as input and get any arbitrary JSON as output. By default JSON types are just a JSON string.</li>\n<li><code>setofFunctionsContainNulls</code>: If none of your <code>RETURNS SETOF compound_type</code> functions mix NULLs with the results then you may set this true to reduce the nullables in the GraphQL schema</li>\n<li><code>classicIds</code>: Enables classic ids for Relay support. Instead of using the field name <code>nodeId</code> for globally unique ids, PostGraphile will instead use the field name <code>id</code> for its globally unique ids. This means that table <code>id</code> columns will also get renamed to <code>rowId</code>.</li>\n<li><code>disableDefaultMutations</code>: Setting this to <code>true</code> will prevent the creation of the default mutation types &#x26; fields. Database mutation will only be possible through Postgres functions.</li>\n<li><code>showErrorStack</code>: Enables adding a <code>stack</code> field to the error response.  Can be either the boolean <code>true</code> (which results in a single stack string) or the string <code>json</code> (which causes the stack to become an array with elements for each line of the stack).</li>\n<li><code>extendedErrors</code>: Extends the error response with additional details from the Postgres error.  Can be any combination of <code>[\'hint\', \'detail\', \'errcode\']</code>. Default is <code>[]</code>.</li>\n<li><code>appendPlugins</code>: an array of <a href="/graphile-build/plugins/">Graphile Build</a> plugins to load after the default plugins</li>\n<li><code>prependPlugins</code>: an array of <a href="/graphile-build/plugins/">Graphile Build</a> plugins to load before the default plugins (you probably don\'t want this)</li>\n<li><code>replaceAllPlugins</code>: the full array of <a href="/graphile-build/plugins/">Graphile Build</a> plugins to use for schema generation (you almost definitely don\'t want this!)</li>\n<li><code>readCache</code>: A file path string. Reads cached values from local cache file to improve startup time (you may want to do this in production).</li>\n<li><code>writeCache</code>: A file path string. Writes computed values to local cache file so startup can be faster (do this during the build phase).</li>\n<li><code>jwtSecret</code>: The secret for your JSON web tokens. This will be used to verify tokens in the <code>Authorization</code> header, and signing JWT tokens you return in procedures.</li>\n<li><code>jwtPgTypeIdentifier</code>: The Postgres type identifier for the compound type which will be signed as a JWT token if ever found as the return type of a procedure. Can be of the form: <code>my_schema.my_type</code>. You may use quotes as needed: <code>"my-special-schema".my_type</code>.</li>\n<li><code>legacyRelations</code>: Some one-to-one relations were previously detected as one-to-many - should we export \'only\' the old relation shapes, both new and old but mark the old ones as \'deprecated\', or \'omit\' the old relation shapes entirely</li>\n<li><code>legacyJsonUuid</code>: ONLY use this option if you require the v3 typenames \'Json\' and \'Uuid\' over \'JSON\' and \'UUID\'</li>\n</ul>\n</li>\n</ul>\n<!-- SCHEMA_DOCBLOCK_END -->\n<h4 id="api-watchpostgraphileschemapgconfig-schemaname-options-onnewschema"><a href="#api-watchpostgraphileschemapgconfig-schemaname-options-onnewschema" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>API: <code>watchPostGraphileSchema(pgConfig, schemaName, options, onNewSchema)</code></h4>\n<p>This function is takes the same options as <code>createPostGraphileSchema</code>; but with\none addition: a function <code>onNewSchema</code> that is called every time a new schema\nis generated, passing the new schema as the first argument. <code>onNewSchema</code> is\nguaranteed to be called before the <code>watchPostGraphileSchema</code> promise resolves.\nIt resolves to an asynchronus function that can be called to stop listening for\nschema changes.</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token comment">// TODO: check this works!</span>\n<span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">let</span> graphqlSchema<span class="token punctuation">;</span>\n  <span class="token keyword">const</span> releaseWatcher <span class="token operator">=</span> <span class="token keyword">await</span> <span class="token function">watchPostGraphileSchema</span><span class="token punctuation">(</span>\n    pgPool<span class="token punctuation">,</span>\n    pgSchemas<span class="token punctuation">,</span>\n    options<span class="token punctuation">,</span>\n    <span class="token punctuation">(</span>newSchema<span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">"Generated new GraphQL schema"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n      graphqlSchema <span class="token operator">=</span> newSchema\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token comment">// graphqlSchema is **guaranteed** to be set here.</span>\n\n  <span class="token comment">// ... do stuff with graphqlSchema</span>\n\n  <span class="token keyword">await</span> <span class="token function">releaseWatcher</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>\n<h4 id="api-withpostgraphilecontextoptions-callback"><a href="#api-withpostgraphilecontextoptions-callback" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>API: <code>withPostGraphileContext(options, callback)</code></h4>\n<p>This function sets up a PostGraphile context, calls (and resolves) the callback\nfunction within this context, and then tears the context back down again\nfinally resolving to the result of your function (which should be a\nGraphQLExecutionResult from executing a <code>graphql()</code> query).</p>\n<ul>\n<li>\n<p><strong><code>options</code></strong>: An object of options that are used to create the context object that gets passed into <code>callback</code>.</p>\n<ul>\n<li><code>pgPool</code>: A required instance of a Postgres pool from <a href="https://www.npmjs.com/package/pg-pool"><code>pg-pool</code></a>. A Postgres client will be connected from this pool.</li>\n<li><code>jwtToken</code>: An optional JWT token string. This JWT token represents the viewer of your PostGraphile schema. You might get this from the Authorization header.</li>\n<li><code>jwtSecret</code>: see \'jwtSecret\' above</li>\n<li><code>jwtAudiences</code>: see \'jwtAudiences\' above</li>\n<li><code>jwtRole</code>: see \'jwtRole\' in the library documentation</li>\n<li><code>jwtVerifyOptions</code>: see \'jwtVerifyOptions\' in the library documentation</li>\n<li><code>pgDefaultRole</code>: see \'pgDefaultRole\' in the library documentation</li>\n<li><code>pgSettings</code>: A plain object specifying custom config values to set in the PostgreSQL transaction (accessed via <code>current_setting(\'my.custom.setting\')</code>) - do <em>NOT</em> provide a function unlike with the library options</li>\n</ul>\n</li>\n<li><strong><code>callback</code></strong>: The function which is called with the <code>context</code> object which was created. Whatever the return value of this function is will be the return value of <code>withPostGraphileContext</code>.</li>\n</ul>\n<h3 id="even-lower-level-access"><a href="#even-lower-level-access" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>Even lower level access</h3>\n<p>If you really want to get into the nitty-gritty of what\'s going on, then take a\nlook at the <code>postgraphile-core</code> and <code>graphile-build-pg</code> modules.</p>',frontmatter:{path:"/postgraphile/usage-schema/",title:"Graphile-Build-PG Usage"}},nav:{edges:[{node:{id:"/Users/benjiegillam/Dev/graphile.org/src/data/nav.json absPath of file [0] >>> JSON",name:"graphile-build",sections:[{id:"guides",title:"Overview"},{id:"library-reference",title:"Using the Library"},{id:"plugin-reference",title:"Building a Plugin"}],pages:[{to:"/graphile-build/getting-started/",title:"Getting Started",sectionId:"guides"},{to:"/graphile-build/plugins/",title:"Plugins",sectionId:"guides"},{to:"/graphile-build/hooks/",title:"Hooks",sectionId:"guides"},{to:"/graphile-build/look-ahead/",title:"Look Ahead",sectionId:"guides"},{to:"/graphile-build/graphile-build/",title:"graphile-build",sectionId:"library-reference"},{to:"/graphile-build/schema-builder/",title:"SchemaBuilder",sectionId:"library-reference"},{to:"/graphile-build/plugin-options/",title:"Options",sectionId:"library-reference"},{to:"/graphile-build/default-plugins/",title:"Default Plugins",sectionId:"library-reference"},{to:"/graphile-build/omitting-plugins/",title:"Omitting Plugins",sectionId:"guides"},{to:"/graphile-build/all-hooks/",title:"All Hooks",sectionId:"plugin-reference"},{to:"/graphile-build/build-object/",title:"Build Object",sectionId:"plugin-reference"},{to:"/graphile-build/context-object/",title:"Context Object",sectionId:"plugin-reference"},{to:"/graphile-build/schema-builder/",title:"SchemaBuilder",sectionId:"plugin-reference"}]}},{node:{id:"/Users/benjiegillam/Dev/graphile.org/src/data/nav.json absPath of file [1] >>> JSON",name:"postgraphile",sections:[{id:"overview",title:"Overview"},{id:"guides",title:"Guides"},{id:"usage",title:"Usage"}],pages:[{to:"/postgraphile/introduction/",title:"Introduction",sectionId:"overview"},{to:"/postgraphile/quick-start-guide/",title:"Quick Start Guide",sectionId:"overview"},{to:"/postgraphile/evaluating/",title:"Evaluating for your Project",sectionId:"guides"},{to:"/postgraphile/requirements/",title:"Requirements",sectionId:"overview"},{to:"/postgraphile/performance/",title:"Performance",sectionId:"overview"},{to:"/postgraphile/connections/",title:"Connections",sectionId:"overview"},{to:"/postgraphile/filtering/",title:"Filtering",sectionId:"overview"},{to:"/postgraphile/relations/",title:"Relations",sectionId:"overview"},{to:"/postgraphile/crud-mutations/",title:"CRUD Mutations",sectionId:"overview"},{to:"/postgraphile/computed-columns/",title:"Computed Columns",sectionId:"overview"},{to:"/postgraphile/custom-queries/",title:"Custom Queries",sectionId:"overview"},{to:"/postgraphile/custom-mutations/",title:"Custom Mutations",sectionId:"overview"},{to:"/postgraphile/smart-comments/",title:"Smart Comments",sectionId:"overview"},{to:"/postgraphile/security/",title:"Security",sectionId:"overview"},{to:"/postgraphile/introspection/",title:"Introspection",sectionId:"overview"},{to:"/postgraphile/extending/",title:"Extending PostGraphile",sectionId:"overview"},{to:"/postgraphile/jwt-guide/",title:"PostGraphile JWT Guide",sectionId:"guides"},{to:"/postgraphile/default-role/",title:"The Default Role",sectionId:"guides"},{to:"/postgraphile/procedures/",title:"PostgreSQL Procedures",sectionId:"guides"},{to:"/postgraphile/postgresql-schema-design/",title:"PostgreSQL Schema Design",sectionId:"guides"},{to:"/postgraphile/postgresql-indexes/",title:"PostgreSQL Indexes",sectionId:"guides"},{to:"/postgraphile/v4-new-features/",title:"v4 Feature Guide",sectionId:"guides"},{to:"/postgraphile/v3-migration/",title:"v3 → v4 Migration Guide",sectionId:"guides"},{to:"/postgraphile/usage-cli/",title:"CLI Usage",sectionId:"usage"},{to:"/postgraphile/usage-library/",title:"Library Usage",sectionId:"usage"},{to:"/postgraphile/usage-schema/",title:"Schema-only Usage",sectionId:"usage"}]}},{node:{id:"/Users/benjiegillam/Dev/graphile.org/src/data/nav.json absPath of file [2] >>> JSON",name:"graphile-build-pg",sections:[{id:"usage",title:"Usage"}],pages:[{to:"/postgraphile/settings/",title:"Settings",sectionId:"usage"}]}}]}},pathContext:{layout:"page"}}}});
//# sourceMappingURL=path---postgraphile-usage-schema-14ca86a2974519fe7f59.js.map