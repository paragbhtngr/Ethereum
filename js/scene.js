var scene = new THREE.Scene();

var width = window.innerWidth;
var height = 0.7*window.innerHeight;
var camera = new THREE.PerspectiveCamera( 75, width/height, 0.1, 10000 );

var renderer = new THREE.WebGLRenderer( { alpha: true } );
renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );

scene.fog = new THREE.FogExp2( 0x111111, 0.01 );

var state = {
    START : 0x00ffff,
    DBPREPREPARE : 0x000044,
    DBPREPARE : 0x000099,
    DBCOMMIT : 0x0000ff,
    DBREPLY : 0x005500,
    CBPREPREPARE : 0x440000,
    CBPREPARE : 0x990000,
    CBCOMMIT : 0xff0000,
    CBREPLY : 0x00ff00
}

// Create transaction plane
var plane_geometry = new THREE.PlaneGeometry( 40, 40, 20,20 );
// var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 });
// var material2 = new THREE.MeshBasicMaterial( { color: 0x222222, wireframe: true} );

var plane_material = new THREE.MeshLambertMaterial( {
    color: 0x704F02,
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1
} );

var plane = new THREE.Mesh( plane_geometry, plane_material );
scene.add( plane );

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
var empty_vertices = Array.apply(null, {length: plane.geometry.vertices.length}).map(Number.call, Number);

function new_vertex_location() {
  if(empty_vertices.length <= 0) {
    // console.log("PLANE IS FULL. TOO MANY NODES");
    return null;
  }
  var idx = getRandomIntInclusive(0, empty_vertices.length - 1)
  var new_vertex = empty_vertices[idx];

  empty_vertices.splice(idx,1);
  return new_vertex;
}
var node_hashes = [];
// create nodes
function add_nodes(i){
  // Check if nodes have died
  // remove dead nodes
  // for (var key in node_hashes) {
  //   if (!(key in data[0].nodes)) { // node is dead
  //     var dead_node = scene.getObjectByName( key );
  //     scene.remove(dead_node);
  //   }
  // }

  // Check for new nodes
  for (var key in data[i][1].states) {
      var uuid = key;
      var txn_amt = data[i][1].txvolumes[key];

      // Check if node is already present
      if (node_hashes.indexOf(uuid) >= 0 ) { // node already exists
        // Check state of node
        var node = scene.getObjectByName(uuid);
        node.material.color.set(state[data[i][1].states[key]]);
        node.position.z = txn_amt*0.00001;
        plane.geometry.vertices[node.userData.location].z = txn_amt*0.00001;

      }
      else {
        // console.log("ADD_NODE" + uuid+":"+txn_amt);

        var node_geometry = new THREE.SphereGeometry( 0.3, 5, 5 );
        var node_material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
        var node = new THREE.Mesh( node_geometry, node_material );

        node.name = uuid;
        node.userData.location = new_vertex_location();

        node.position.x = plane.geometry.vertices[node.userData.location].x;
        node.position.y = plane.geometry.vertices[node.userData.location].y;
        // node.name = "node_"+ i.toString();
        // node.position.z = plane.geometry.vertices[i].position.z;

        // TODO: Update position based on plane vertices

        node_hashes.push(uuid);
        scene.add( node );
      }

  }
}

// lights
light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 1, 1, 1 );
scene.add( light );

light = new THREE.DirectionalLight( 0x002288 );
light.position.set( -1, -1, -1 );
scene.add( light );

light = new THREE.AmbientLight( 0x222222 );
scene.add( light );


// camera
camera.position.z = 15;
controls = new THREE.OrbitControls( camera );
controls.addEventListener( 'change', render );


window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );
}

var update = function(i){
  // while there are timesteps

  // get all

    add_nodes(i);

    // for (var i = 0; i < plane.geometry.vertices.length; i++) {
        // plane.geometry.vertices[i].z += Math.random()*0.1 - 0.05;
        // plane.geometry.verticesNeedUpdate = true;

        // node = scene.getObjectByName( "node_"+i.toString() );
        // node.position.z = plane.geometry.vertices[i].z;
    // }

    // wireframe
    var helper = scene.getObjectByName( "helper" );
    scene.remove(helper);
    var helper = new THREE.WireframeHelper( plane, 0x676767 ); // or THREE.WireframeHelper
    helper.name = "helper";
    helper.material.linewidth = 2;
    scene.add( helper );
};

// var raycaster = new THREE.Raycaster();
// var mouse = new THREE.Vector2();

// function onMouseMove( event ) {
//
// 	// calculate mouse position in normalized device coordinates
// 	// (-1 to +1) for both components
//
// 	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
// 	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
//
// }

// var prevIntersects;
var timestamp_counter = 0;
var update_counter = 0
var render = function () {

    if(timestamp_counter < data.length) {
      if(update_counter >= 2){
        update(timestamp_counter);
        update_counter = 0;
        timestamp_counter++;

        // Update the graphs
        tick_2_din(data[timestamp_counter][1]['graphdata'][0]);
      }
      else {
        update_counter++;
      }
    }
    // raycaster.setFromCamera( mouse, camera );

    // var intersects = raycaster.intersectObjects( scene.children );

//     for ( var i = 0; i < intersects.length; i++ ) {
//         if (intersects[i].object.name.substring(0,4) == "node"){
//             prevIntersects = intersects[i].object.name;
//             intersects[ i ].object.material.color.set( 0xff0000 );
//         }
// 	}

// 	for ( var i = 0; i < prevIntersects.length; i++ ) {
// 	    for ( var j = 0; j < intersects.length; j++ ) {
// 	        if (intersects[j].object.name == prevIntersects[i]){
// 	        }
// 	        else {
// 	            intersects[j].object.material.color.set( 0x00ffff );
// 	        }
// 	    }
// 	}

    renderer.render(scene, camera);
    setTimeout( function() {
        // window.addEventListener( 'mousemove', onMouseMove, false );
        requestAnimationFrame( render );
    }, 1000 / 25 );
};

var data;

function init(json_data) {
  data = json_data;
  render();
}

// read in json
// var d = new Date();
// var n = d.getMilliseconds();
// console.log("BEFORE JSON: " + n);
// $.getJSON( "http://localhost:8000/json/100-2-100.json", function( data ) {
//   var d = new Date();
//   var n = d.getMilliseconds();
//   console.log("AFTER JSON:" + n);
// });

// $.getJSON( "http://localhost:8000/json/100-2-100.json", function( data ) {
$.getJSON( "http://localhost:8000/json/100-2-100.json", function( data ) {

    init(data);
});
