import { HierarKey } from 'https://deno.land/x/hierarkey/mod.ts'

export class Node<T> {  
    public type: string = ''
    protected _data: T 

    public get data(): T {
        return this._data
    }

    public set data(value: T) {
        if ( typeof value === 'string') {
            this.type = 'string'
        } 
        else {
            this.type = (value as Object).constructor.name
        }
        this._data = value
    }

    constructor( public name: string, _data: T = name as unknown as T ) {
        this._data = _data
        this.type = typeof _data === 'string' ? name : (_data as Object).constructor.name
    }
}

export class CxGraph {

    public nodes = new Map<string, Node<any>>();
    public outgoingEdges = new Map<string, string[]>(); 
    public incomingEdges = new Map<string, string[]>();

    constructor( private circular: boolean = false) { }

    /**
     * Returns the number of nodes in a graph.
     */
    get size(): number {
        return this.nodes.size
    }

    /**
     * Returns the outgoing edges for a single given a node name.
     * @param name Node name.
     * @returns string[] of node names
     */
    getOutgoingEdges( name: string ) {
        let res = this.outgoingEdges.get(name)
        return res !== undefined ? res : []
    }

    /**
     * Returns the incoming edges for a single given a node name.
     * @param name Node name.
     * @returns string[] of node names
     */
    getIncomingEdges( name: string ): string[] {
        let res = this.incomingEdges.get(name)
        return res !== undefined ? res : []
    }

    /**
     * Sets a Node instance .
     * @param name Node name.
     */
    setNode(node: Node<any>): void {
        if ( this.nodes.has(node.name) ) throw new Error(`A node with the name of "${node.name}" already exists in the graph!`);
        this.nodes.set(node.name, node)
        this.outgoingEdges.set(node.name, [])
        this.incomingEdges.set(node.name, [])  
    }

    /**
     * Returns the Node instance given a node name.
     * @param name Node name.
     */
    getNode(name: string): Node<any> {
        if ( this.nodes.has(name) )
            return this.nodes.get(name)!
        else 
            throw new Error(`GetNode: Node "${name}" not found!`);
    }

    /**
     * Returns an array of Top Node names.
     * @returns string[] an array of Top Node names
     */
    getTopNodeNames(): string[] {
        let res: string[] = []
        this.overallOrder().forEach( (name: string) => {
            let deps: string[] = this.getIncomingEdges(name)
            if ( deps.length === 0 ) {
                res.push(name)
            }
        })
        return res
    }

    /**
     * Gets the data part of a named existing Node instance
     * @param name Node name.
     * @return data The Node data.
    */ 
    getNodeData<T>( name: string ): T {
        return this.getNode(name).data as T 
    }

    /**
     * Sets the data part of a named existing Node instance.
     * @param name Node name.
     * @param data The new Node data.
    */ 
    setNodeData<T>(name: string, data: T ): void {
        if ( ! this.nodes.has(name) ) throw new Error(`A node with the name of "${name}" does NOT exists in the graph!`)
        if ( ! data ) throw new Error(`Cannot set node "${name}" to a null/empty data object!`)
        this.nodes.get(name)!.data = data
    }

    /**
     * Checks for the existance of the Node
     * @param string Node name.
    */
    hasNode(name: string): boolean {
        return this.nodes.has(name);
    }

    /**
     * Add a Node to the graph.
     * @param nodeOrString Node object or Node name in string.
     */
    addNode( _node: Node<any> | string ): void {
        let node = typeof(_node) === 'string' ? new Node( _node, _node) : _node
        this.setNode(node)
    }

     /**
     * Adds a Top Node to the graph.
     * @param nodeOrString Node object or Node name string.
     */
    addTopNode( _node: Node<any> | string ): void {
        let node = typeof(_node) === 'string' ? new Node( _node, _node) : _node
        this.setNode(node)
        this.getTopNodeNames().forEach( name => { 
            if ( name !== node.name ) this.addDependency(node.name, name) 
        })
    }

    /**
     * Updates the Top Node of the graph by adding other newly created top level nodes to its dependencies
     * @param string  The Top Node name.
     */
    updTopNode( topName: string ): void {
        if ( ! this.hasNode( topName ))  throw new Error(`A node with the name of "${topName}" does NOT exists in the graph!`)
        if (  this.getIncomingEdges( topName ).length > 0 ) throw new Error(`Cannot update a Top Node: "${topName}" that has incoming edges!`)
        this.getTopNodeNames().forEach( name => {
            if ( name !== topName && ! this.getOutgoingEdges(name).includes(name) ) 
                this.addDependency(topName, name) 
        })
    }

    /**
    * Filters an Array and return a new Array with all occurrences of a specific string removed
    * @param string Name of an element to exclude
    * @param string[] The Array to filter
    */
    filter( exclStr: string, strArr: string[] ): string[] {
        return strArr.filter( ( value, idx ) => { return value !== exclStr} )
    }

    /**
   * Remove a node from the dependency graph. If a node does not exist, this method will do nothing.
   * @param string Node name.
   */
    removeNode(node: string ): void {
        if (this.hasNode(node)) {
            this.nodes.delete(node);
            this.outgoingEdges.delete(node);
            this.incomingEdges.delete(node);

            this.incomingEdges.forEach( ( strArr, key  ) => {
                if ( strArr.includes(node ) )
                    this.incomingEdges.set( key, this.filter(node, strArr) )
            })

            this.outgoingEdges.forEach( ( strArr, key  ) => {
                if ( strArr.includes(node ) )
                    this.outgoingEdges.set( key, this.filter(node, strArr) )
            })
        }
    }

    /**
    * TODO: maybe add a transition name 
    * Adds a node dependence. "from" is dependent on "to"
    *  @param from Node name.
    *  @param to  Node name.
    */
    addDependency(from: string, to: string): void {  
        if ( ! this.nodes.has(from) ) throw new Error(`Node does not exist: ${from}`);
        if ( ! this.nodes.has(to) ) throw new Error(`Node does not exist: ${to}`);
        if (from === to) throw new Error(`Cannot add self dependency: ${to}`);

        if (!this.outgoingEdges.get(from)!.includes(to)) {
            let depArr = this.outgoingEdges.get(from)! 
            depArr.push(to)
            this.outgoingEdges.set( from, depArr ) 
        }
        if (!this.incomingEdges.get(to)!.includes(from)) {
            let depArr = this.incomingEdges.get(to)!
            depArr.push(from)
            this.incomingEdges.set( to, depArr ) 
        }
    }
    
     /**
     * Removes a node dependence. "from" is no longer dependent on "to".
     * @param from Node name.
     * @param to  Node name.
     */
    removeDependency(from: string, to: string): void {
        if ( ! this.nodes.has(from) ) throw new Error(`Node does not exist: ${from}`);
        if ( ! this.nodes.has(to) ) throw new Error(`Node does not exist: ${to}`);
        if (from === to) throw new Error(`Cannot remove self dependency: ${to}`);

        if (!this.outgoingEdges.get(from)!.includes(to)) {
            this.outgoingEdges.get(from)!.splice(this.outgoingEdges.get(from)!.indexOf(to), 1);
        }
        if (!this.incomingEdges.get(to)!.includes(from)) {
            this.incomingEdges.get(to)!.splice(this.incomingEdges.get(to)!.indexOf(from), 1)
        }
    }

    /**
   * Get an array containing the nodes that the specified node depends on (transitively).
   *
   * Throws an Error if the graph has a cycle
   *
   * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned
   * in the array.
   */

   /**
    * Get an array containing the nodes that the specified node depends on (transitively).
    * Throws an Error if the graph has a cycle
    * 
    * @param node the name of the root node
    * @param [leavesOnly] If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned in the array.
    * @returns A string array of dependencies 
    */
   dependenciesOf(node:string, leavesOnly:boolean = false) : string[] {
        let result: string[] = [];
        if (this.nodes.has(node)) {
            let DFS = this.createDFS(this.outgoingEdges, leavesOnly, result, this.circular);
            DFS(node)
            result = this.filter( node, result )
        }
        return result
    }

     /**
     * Get an array containing the nodes that depend on the specified node (transitively).
     * Throws an Error if the graph has a cycle
     * 
     * @param node The name of the node 
     * @param leavesOnly If leavesOnly is true, only nodes that do not have any dependants will be returned in the array.
     */
    dependantsOf( node: string, leavesOnly: boolean = false ): string[] {
        if ( this.nodes.has(node) ) {
            var result: string[] = [];
            var DFS = this.createDFS(this.incomingEdges, leavesOnly, result, this.circular);
            DFS(node);
            result = this.filter( node, result )
            return result;
        } 
        else {
            throw new Error('dependantsOf: Node does not exist: ' + node);
          }
    }

    /**
     * Get an array containing the TOP nodes names.
     * 
     * @returns An array of Top Node names
     */
    overallTopNodes(): string[] {
        let topNodes: string[] = []
        this.nodes.forEach( ( value, key ) => {
            if ( this.incomingEdges.get(key)!.length === 0 ) topNodes.push(key)
        })
        return topNodes
    }

    /**
     * Get an array containing Orphan nodes names. 
     * 
     * @returns An array of Orphan Node names
     */
    overallOrphans(): string[] {
        let orphans: string[] = []
        this.nodes.forEach( ( value, key ) => {
            if ( this.incomingEdges.get(key)!.length === 0 && this.outgoingEdges.get(key)!.length === 0 ) orphans.push(key)
        })
        return orphans
    }

    /**
     * Depth-First-Search on a set of edges.
     *
     * Detects cycles and throws an Error if one is detected.
     *
     * @param edges The set of edges to DFS through
     * @param leavesOnly Whether to only return "leaf" nodes (ones who have no edges)
     * @param stepSize The length of each entry in the hierarKey path representation
     */
   
    createEnhangedDFS (edges: Map<string, string[]>,  result: Map<string,string>, stepSize:number): Function {
        let currentPath: string[]   = []
        let visited: {[name: string]: boolean} = {}
        let firstNode: boolean      = true
        let hierarKey = new HierarKey( 1, stepSize )

        return function DFS( currentNode:string, rootNode: boolean = false ) {
            let firstKey: string
            visited[currentNode] = true
            currentPath.push( currentNode )

            if ( firstNode ) {
                result.set( currentNode, hierarKey.currLeaf)
                firstNode = false
            }
            else if ( rootNode ) {
                result.set( currentNode, hierarKey.jumpToLevel('0') ) 
            }

            edges.get(currentNode)!.forEach( ( node: string, idx: number ) => {
                if ( ! visited[node] ) {
                    if ( idx == 0  ) { 
                        result.set( node,hierarKey.nextLevel() ) 
                    }
                    else {    
                        let parentKey =  result.get( currentNode )    
                        let childKey  =  hierarKey.jumpToLevel(parentKey + '.0')
                        result.set( node, childKey )
                    }
                    DFS(node)
                } 
                else {
                    throw new Error(`createEnhangedDFS: Circular reference in Dependency Graph not allowed here: ${JSON.stringify (currentPath)}`)
                }
            })
            currentPath.pop()
            if ( edges.get(currentNode)!.length === 0 && ! result.has(currentNode) ) {
                result.set( currentNode, hierarKey.nextLeaf() )
            }
        }
    }

    /**
     * Construct the overall processing order for the whole dependency graph. 
     * 
     * @param [reverse] Do a reverse sort of the result based on the id strings 
     * @param [stepSize] The hierarchy is strings step size
     * @returns   A numbered Map<string,string> representation of the hierarchy
     */
    overallHierarchy( reverse: boolean = false, stepSize: number = 0 ): Map<string,string> {
        var self = this
        var result = new Map<string,string>()
        let enhangedResult = new Map<string, string>()
        let minSize = this.size.toString().length
        stepSize = stepSize > minSize  ? stepSize : minSize
        // var keys = Object.keys(this.nodes)
        if (this.nodes.size === 0) {
            return result // Empty graph
        } 
        else {
            let keys = [ ...this.nodes.keys() ]
            // Look for cycles - we run the DFS starting at all the nodes in case there
            // are several disconnected subgraphs inside this dependency graph.
            var CycleDFS = this.createDFS(this.outgoingEdges, false, [], this.circular)
            keys.forEach( (n) => {
                CycleDFS(n)
            })

            var DFS = this.createEnhangedDFS(this.outgoingEdges, result, stepSize )
            // Find all potential starting points (nodes with nothing depending on them) an
            // run a DFS starting at these points to get the order
            keys.filter( (node) => {
                return self.incomingEdges.get(node)!.length === 0;
            }).forEach( (n) => {
                DFS(n, true)
            })

            if ( reverse ) {
                let sortedMap: Map<string,string> =  new Map( [...result.entries() ].sort( ( a:string[], b:string[] ) => { return a[1] < b[1] ? -1 : a[1] == b[1] ? 0 : 1} ).reverse() )
                return sortedMap
            }
            else return result;
        }
    }
  
    /**
     * Get the hierarchy of dependencies for a given node
     * 
     * @param node The name of the node
     * @param [reverse] Do a reverse sort of the result based on the id strings
     * @param [stepSize] The hierarchy is strings step size
     * @returns  A Map<string,string> representation of the hierarchy 
     */
    hierarchyOf( node:string, reverse: boolean = false, stepSize: number = 0 ): Map<string,string> {
        let minSize = this.size.toString().length
        stepSize = stepSize > minSize  ? stepSize : minSize
        let result  = new Map<string, string>()
        if (this.nodes.has(node)) {       
            let DFS = this.createEnhangedDFS(this.outgoingEdges, result, stepSize); // leavesonly and circular are not applicable here
            DFS(node)
            if ( reverse ) {
                result =  new Map( [...result.entries()].sort( ( a:string[], b:string[] ) => { return a[1] < b[1] ? -1 : a[1] == b[1] ? 0 : 1} ).reverse() )
            }
        }
        return result
    }

    /**
     * Get the hierarchies of dependencies for all the nodes that are leaf dependants of the supplied node. 
     * This function looks up the leaf dependants for the supplied node parameter and for each of these it 
     * produces a dependency tree.
     * 
     * @param node The name of the node
     * @param [reverse] Do a reverse sort of each of the result based on the id strings
     * @param [stepSize] The hierarchy is strings step size
     * @returns  An array of  Map<string,string> representation of the hierarchies 
     */
    hierarchyOfDependants(node:string, reverse: boolean = false, stepSize: number = 0 ):  Map<string, string>[] {
        let dependants = this.dependantsOf( node, true )
        let result: Map<string, string>[] = []
        dependants.forEach(( dependant ) => {
            result.push(this.hierarchyOf( dependant, reverse, stepSize)!)
        })
        return result
    }

    /**
     * Depth-First-Search on a set of edges.
     *
     * Detects cycles and throws an Error if one is detected.
     *
     * @param edges The set of edges to DFS through
     * @param leavesOnly Whether to only return "leaf" nodes (ones who have no edges)
     * @param result An array in which the results will be populated
     * @param circular A boolean to allow circular dependencies
     */
   
    createDFS (edges: Map<string, string[]>, leavesOnly: boolean, result: string[] , circular: boolean = false ): Function {
        let currentPath: string[]   = []
        let visited: {[name: string]: boolean} = {}

        return function DFS( currentNode:string  ) {
            visited[currentNode] = true
            currentPath.push( currentNode )
            
            edges.get(currentNode)!.forEach( ( node: string ) => {
                if ( ! visited[node] ) {
                    DFS(node)
                } 
                else if ( currentPath.indexOf(node) >= 0 ) {
                    currentPath.push(node)
                    if ( !circular ) {
                        throw new Error(`CircularError in Dependency Graph: ${JSON.stringify (currentPath)}`)
                    }
                }
            })
            currentPath.pop()
            if ((!leavesOnly || edges.get(currentNode)!.length === 0) && result.indexOf(currentNode) === -1) {
                result.push(currentNode)
            }
        }
    }

    /**
     * Construct the overall processing order for the dependency graph.
     * 
     * @param [leavesOnly] If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned
     * @returns  A string array of the named dependencies 
     */
    overallOrder(leavesOnly: boolean = false ): string[] {
        var self = this
        var result: string[] = []

        if (this.nodes.size === 0) {
            return result // Empty graph
        } 
        else {
            let keys = [ ...this.nodes.keys() ]
            // Look for cycles - we run the DFS starting at all the nodes in case there
            // are several disconnected subgraphs inside this dependency graph.
            var CycleDFS = this.createDFS(this.outgoingEdges, false, [], this.circular)
            keys.forEach( (n) => {
                CycleDFS(n)
            })

            var DFS = this.createDFS(this.outgoingEdges, leavesOnly, result, this.circular)
            // Find all potential starting points (nodes with nothing depending on them) an
            // run a DFS starting at these points to get the order
            keys.filter(function (node) {
                return self.incomingEdges.get(node)!.length === 0;
            }).forEach(function (n) {
                DFS(n, true)
            })

            return result;
        }
    }
}