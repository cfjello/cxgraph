# CxGraph - A Deno Module

A package to produces dependency graphs for nodes in a hierarchy. This package owes a lot to https://www.npmjs.com/package/dependency-graph, but this is a Deno typeScript implementation with a modified API that adds a sortable hierarchical numbering to the dependency graph.

## Usage 

Nodes names in the graph are just simple strings with optional data associated with them. This data can be of any type and defaults to the name of the node if not supplied:

```
// file: examples/example_A.ts
import {CxGraph, Node} from '../mod.ts'

let g = new CxGraph()
g.addNode( new Node('A') )  
g.addNode( new Node('B') )

// Set some data 
g.addNode( new Node('C', 'C-Node') )
g.addNode( new Node('D', ['D-0', 'D-1']) )
g.addNode( new Node('E', { type: 'Object'}) )
g.addNode( new Node('F') )

// Modify the data for node A
class A_Class { 
    constructor ( public i: number = 1 ) {}
}
let a = new A_Class()
g.setNodeData('A', a)
g.addNode( new Node('G') )
g.addNode( new Node('H') )
g.addNode( new Node('I') )
g.addNode( new Node('J') )

// Add the dependencies
g.addDependency('A', 'B')
g.addDependency('A', 'C')
g.addDependency('A', 'J')
g.addDependency('B', 'D')
g.addDependency('B', 'E')
g.addDependency('C', 'F')
g.addDependency('C', 'G')
g.addDependency('G', 'H')
g.addDependency('E', 'I')


console.log('Show the dependencies of node C:')
console.log( g.dependenciesOf('C') ) 

console.log('Show the overall graph from leafs to top node(s):')
console.log( g.overallOrder() )
```
Run the TypeScript file:
```
deno run examples/example_A.ts
```
This example will display:

```
Show the dependencies of node C:
[ 'F', 'H', 'G' ]
Show the overall graph from leafs to top node(s):
[
  'D', 'I', 'E', 'B',
  'F', 'H', 'G', 'C',
  'J', 'A'
]
```
By adding the code:
```
console.log('Show the hierarchy of the graph from the top node A:')
let map: Map<string,string> = g.hierarchyOf('A') 

map.forEach( ( value, key ) => {
    console.log ( `${value}: ${key}` ) 
})
```
you get the following additional output:
```
Show the hierarchy of the graph from the top node A:
01: A
01.01: B
01.01.01: D
01.01.02: E
01.01.02.01: I
01.02: C
01.02.01: F
01.02.02: G
01.02.02.01: H
01.03: J
```
To view the dependency hierarchy in reverse order and with 4 digit numbering of each level, add the code:
```
console.log('Show the hierarchy graph in reverse order:')
let mapReverse: Map<string,string> = g.hierarchyOf('A', true, 4) 

mapReverse.forEach( ( value, key ) => {
    console.log ( `${value}: ${key}` ) 
})
```
This code produces the output:
```
Show the hierarchy graph in reverse order:
0001.0003: J
0001.0002.0002.0001: H
0001.0002.0002: G
0001.0002.0001: F
0001.0002: C
0001.0001.0002.0001: I
0001.0001.0002: E
0001.0001.0001: D
0001.0001: B
0001: A
```

## The CxGraph API

 - `addNode( _node: Node<any> | string ): void` - add a node in the graph with optional data. If `data` is not given, `name` will also be used as data
 -  `getNodeData<T>( name: string ): T` - returns the data part of a named node

Using typescript you can create a typed node and fetch a typed `getNodeData<T>`:
```
// file: examples/example_B.ts
import {CxGraph, Node} from '../mod.ts'

let g = new CxGraph()

class DateClass {    
    constructor (  public date: Date = new Date('2017-07-14 11:45:00')  ) {}
}

let node = new Node<DateClass>('A', new DateClass() )

g.addNode(node)

console.log( g.getNodeData<DateClass>('A').date)
```
Run the Tyscript file:
```
deno run examples/example_B.ts
```
 - `removeNode(name: string): void` - remove a node from the graph
 - `hasNode(name: string): boolean` - check if a node exists in the graph
 - `size(): number` - return the number of nodes in the graph
 - `getNode(name: string): Node` - get the data associated with a node (will throw an `Error` if the node does not exist)
 - `setNode(name: string, data: T): void` - set the data for an existing node (will throw an `Error` if the node does not exist or if the supplied data is null or empty)
 - `addDependency(from, to): void` - add a dependency between two nodes (will throw an `Error` if one of the nodes does not exist)
 - `removeDependency(from, to): void` - remove a dependency between two nodes
-  `hierarchyOf( node:string, reverse: boolean = false, stepSize: number = 0 ): Map<string,string>` - Get the hierarchy of dependencies for the given node. set reverse equal to true for a reverse sort of the result based on the id strings, and use stepSize to enlarge the number of digits in the strings used the represent the hierarchy levels.
- ` overallHierarchy( reverse: boolean = false, stepSize: number = 0 ): Map<string,string>` - Get an array of hierarchy maps (since the overall graph may have multiple top nodes)
 - `dependenciesOf(name, leavesOnly)` - get an array containing the nodes that the specified node depends on (transitively). If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned in the array.
  - `overallOrder(leavesOnly)` - construct the overall processing order for the dependency graph. If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned.
 - `dependantsOf(name, leavesOnly)` - get an array containing the nodes that depend on the specified node (transitively). If `leavesOnly` is true, only nodes that do not have any dependants will be returned in the array.
 - `hierarchyOfDependants(node:string, reverse: boolean = false, stepSize: number = 0 ): Map<string, string>[]`- This function first finds the leaf `dependantOf('nodeName', true)` and for each of these it calls `hierarchyOf(...)` to get the complete dependency tree for each of the dependant leaf nodes:
```
// file: examples/example_C.ts
import {CxGraph, Node} from '../mod.ts'

 let g = new CxGraph()
 g.addNode( new Node('A') ) 
 g.addNode( new Node('B') )
 g.addNode( new Node('C', 'C-Node') )
 g.addNode( new Node('D', ['D-0', 'D-1']) )
 g.addNode( new Node('E', { type: 'Object'}) )
 g.addNode( new Node('F') )
 g.addNode( new Node('G') )
 g.addNode( new Node('H') )
 g.addNode( new Node('I') )
 g.addNode( new Node('J') )
   
 g.addDependency('A', 'C')
 g.addDependency('B', 'D')
 g.addDependency('B', 'E')
 g.addDependency('C', 'F')
 g.addDependency('C', 'G')
 g.addDependency('G', 'H')
 g.addDependency('H', 'I')
 g.addDependency('E', 'I')
 
let hierarKeyRep: Map<string,string>[] = g.hierarchyOfDependants('I')
console.log(hierarKeyRep)
```
Run the TypeScript file:
```
deno run examples/example_C.ts
```
and the output will be:
```
[
  Map {
    'A' => '01',
    'C' => '01.01',
    'F' => '01.01.01',
    'G' => '01.01.02',
    'H' => '01.01.02.01',
    'I' => '01.01.02.01.01'
  },
  Map {
    'B' => '01',
    'D' => '01.01',
    'E' => '01.02',
    'I' => '01.02.01'
  }
]
```

 For more API information please look at the mod_test.ts file for now.
