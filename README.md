# DocsOnFileBD Client
A simple terminal to interact with DocsOnFileDB databases.

# Contents
<!-- TOC updateOnSave:true -->

- [DocsOnFileBD Client](#docsonfilebd-client)
- [Contents](#contents)
- [Installation](#installation)
- [Command-line options](#command-line-options)
- [DFDB terminal commands](#dfdb-terminal-commands)
- [Licence](#licence)

<!-- /TOC -->

# Installation
```
npm install --save-dev dfdb-client
```

Or:
```
npm install --global dfdb-client
```
# Command-line options
```
Usage: dfdb-client [options]
Options:
  -v --version                  output the version number
  -d, --dbname [database-name]  Database name.
  -p, --dbpath [database-path]  Database directory.
  -o, --open [full-db-path]     Full database file path.
  -h, --help                    output usage information
```

# DFDB terminal commands
```
These the available options:
    'add-index'
        Adds an index on a collection for certain field.
            Usage: add-index collection-name field-name

    'collections'
        Lists all collections of current connection.
            Aliases: 'cols'
            Usage: indexes collection-name

    'connect'
        Opens a database connection and sets it as current.
            Usage: connect db-name [db-path]

    'delete'
        Deletes a document from certain collection.
            Aliases: 'd'
            Usage: delete collection-name id

    'disconnect'
        Closes current database connection.
            Aliases: 'closedb'

    'drop-collection'
        Deletes certain collection and all its assets.
            Usage: drop-collection collection-name

    'drop-index'
        Drops an index for certain field from a collection.
            Usage: drop-index collection-name field-name

    'exit'
        Closes this terminal.

    'find'
        Searches for some conditions on a collection (using only indexed fields).
            Aliases: 'f'

    'help'
        Displays this help information.
            Aliases: '?'

    'initializer'
        Displays current connection initialization specifications.
            Aliases: 'init'

    'insert'
        Inserts a new document to certain collection.
            Aliases: 'i'
            Usage: insert collection-name document

    'indexes'
        Lists all indexes of certain collection.
            Usage: indexes collection-name

    'open'
        Opens a database connection and sets it as current based on its full path.
            Usage: open full-db-path

    'rebuild-index'
        Rebuilds an index on certain collection.
            Aliases: 'rebuild'
            Usage: rebuild-index collection-name field-name

    'remove-schema'
        Removes the schema specification from a collection.

    'schema'
        loads and displays a collection's schema.
            Usage: schema collection-name

    'search'
        Searches for some conditions on a collection.
            Aliases: 's'

    'set-initializer'
        Sets a new initializer specification to current connected database based on a JSON file.
            Aliases: 'set-init'

    'set-schema'
        Sets a new schema specification to a collection based on a JSON file.

    'toggle-expanded'
        Changes the way objects are displayed.
            Aliases: 'expanded'

    'truncate'
        Removes all data of certain collection.
            Usage: truncate collection-name

    'update'
        Updates a document once certain collection.
            Aliases: 'u'
            Usage: update collection-name id document
```

# Licence
MIT &copy; 2018 [Alejandro Dario Simi](http://daemonraco.com)
