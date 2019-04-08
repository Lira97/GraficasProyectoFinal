var renderer = null, 
scene = null,raycaster , 
camera = null,
root = null,
group = null,groupTree=null,
orbitControls = null;
var game = false;
var crashBuilding= 0;
var floor;

var velocity = new THREE.Vector3();var prevTime = performance.now();

var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var counter = 0;
var actualTime = 0;
var highScore = 0;
var animator = null,
duration1 = 1,
loopAnimation = false;
var deadAnimator;
var dancers = [];
var score = 0;
var duration = 20000; // ms
var currentTime = Date.now();
var max = 22;
var min = -22;
var maxDragonY = 8;
var minDragonY = -2;
var MAXRobots = 10;
var objLoader = null
var positionsX;
var shots= [];
var enemies= [];

var bullets = [];

var playerweapon;
var player = { height:54, speed:1.2, turnSpeed:Math.PI*0.02, canShoot:0 };
var keyboard = {};

var meshes = {};
var particleGeometry;
var particleCount=20;
var explosionPower =1.06;

function startGame()
{

    if(highScore<score)
    {
         highScore = score;
    }
        
    document.getElementById("highScore").innerHTML = "best score: " +highScore;
    gameMinutes = 0
    gameStarted = Date.now();
    actualTime = Date.now();
    actualTime2 = Date.now();
    score = 0;
    names = 0;
    robotsSpawned = 0;
    document.getElementById("time").innerHTML = 60+" s";
    document.getElementById("score").innerHTML = "score: " +score;
    document.getElementById("startButton").style.display="none";
    document.getElementById("startButton").disabled = true;
    

    game = true;
    
}

function loadLevel()
{
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.load('models/map.mtl', function(materials)
    {
        materials.preload();
        
        var objLoader = new THREE.OBJLoader();
        
        objLoader.setMaterials(materials);
        objLoader.load('models/map.obj', function(mesh)
        {
            
            mesh.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });    
            mesh.scale.set(.5,.5,.5);
            mesh.position.z = 0;
            mesh.position.y = 4;
            mesh.position.x = 0;
            
            group.add(mesh);
            
        });
    });  
}
function loadWeapon()
{
    // var mtlLoader = new THREE.MTLLoader();
    // mtlLoader.load('models/uziGold.mtl', function(materials)
    // {
    //     materials.preload();
        
    //     var objLoader = new THREE.OBJLoader();
        
    //     objLoader.setMaterials(materials);
    //     objLoader.load('models/uziGold.obj', function(object)
    //     {
            
    //         object.traverse( function ( child ) 
    //         {
    //             if ( child instanceof THREE.Mesh ) 
    //             {
    //                 child.castShadow = true;
    //                 child.receiveShadow = true;
    //             }
    //         });
    //         weapon = object;
    //         weapon.scale.set(10,10,10);
    //         weapon.scale.set(10,10,10);
    //         weapon.position.set(-90, 30, 1100);
    //         group.add(object);

            
    //     });
    // });
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    objLoader.load('models/weapon/gunCombined_process.obj',

        function(object)
        {
            var normalMap = new THREE.TextureLoader().load('models/weapon/T_gun_N.png');
            var texture = new THREE.TextureLoader().load('models/weapon/T_gun_BC.png');

            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    child.material.normalMap = normalMap;
                }
            } );                
            weapon = object;
            weapon.scale.set(2,2,2);
            weapon.position.set(0, 30, 1100);
            group.add(object);
                },

        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });  
}
function loadEnemy()
{
    var loader = new THREE.FBXLoader();
    loader.load( 'models/enemies/cacademon/cacodemon.FBX', function ( object ) 
    {

        var texture = new THREE.TextureLoader().load('models/enemies/cacademon/cacodemon_d.png');
        var normalMap = new THREE.TextureLoader().load('models/enemies/cacademon/cacodemon_n.png');

        object.traverse( function ( child ) 
        {
            if ( child instanceof THREE.Mesh ) 
            {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
            }
        } );
        
        enemy = object;
        enemy.scale.set(.1,.1,.1);
        enemy.position.set(-90, 30, 1000);
        // enemy.bbox = new THREE.Box3()
        // enemy.bbox.setFromObject(enemy)
        group.add(enemy);
        enemies.push(enemy);
            
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}

function bullet(initialPos)
{
    var geometry = new THREE.CylinderGeometry( .3, .3, 2, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var shot = new THREE.Mesh( geometry, material );

    shot.rotation.set(Math.PI,0,0)
    shot.position.copy(initialPos)
    shot.bbox = new THREE.Box3()
    shot.bbox.setFromObject(shot)
    return shot  
}
function cloneTree (i)
{
    var newDancer = tree.clone();
    newDancer.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    newDancer.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -110);
    dancers.push(newDancer);
    scene.add(newDancer);
}
function cloneEnemies (i)
{
    var newEnemie = enemy.clone();
    newEnemie.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    newEnemie.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -110);
    enemies.push(newEnemie);
    scene.add(newEnemie);
}

function animate() {
    // spaceship.bbox.setFromObject(spaceship)

    var now = Date.now();
    var finish = now - gameStarted;
    currentTime = now;
    var time = Date.now() * 0.0005;

    var seconds = (now - actualTime)/1000
    
    // if (seconds >= 1.5 )
    // {
    //     if ( counter < MAXRobots) 
    //     {
    //             counter += 1;
    //             cloneTree(counter);
    //             cloneEnemies(counter);
    //             actualTime = now; 
    //     }
    // }

    // if (dancers.length > 0) 
    // {
    //     for(dancer_i of dancers)
    //     {
    //             dancer_i.bbox.setFromObject(dancer_i)
    //             if(spaceship.bbox.intersectsBox(dancer_i.bbox))
    //             {
    //                 crashBuilding += 1
    //                 if (crashBuilding >= 8)
    //                 {
    //                     crashBuilding = 0
    //                     explode(spaceship.position.x,spaceship.position.y,spaceship.position.z);
    //                     document.getElementById("health").value -= 30;
    //                 }

    //             }

    //             dancer_i.position.z += 1.2 ;
    //             dancer_i.position.y = -4 ;   

    //     } 
    //         if(dancer_i.position.z >= camera.position.z-5)
    //         {  
    //                 dancer_i.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -105);
                
    //         }
    
    
    // }

    // if ( enemies.length > 0) 
    // {
    //     for(enemies_i of enemies)
    //     {
    //             for(shot_i of shots)
    //             {
    //                 shot_i.bbox.setFromObject(shot_i)
    //                 if(shot_i.bbox.intersectsBox(enemies_i.bbox.setFromObject(enemies_i)))
    //                 {
    //                     explode(enemies_i.position.x,enemies_i.position.y,enemies_i.position.z);
    //                     // scene.remove(shot_i)
    //                     // shots.splice(i, 1)
    //                     score ++;
    //                     document.getElementById("score").innerHTML = "score: " +score;
    //                     enemies_i.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -105);
    //                 }
    //             }

    //             enemies_i.position.z += 1 ;
            
    //         if(enemies_i.position.z >= camera.position.z-5)
    //         {  
    //                 enemies_i.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -105);
                
    //         }
    //     }
    
    // }
    doExplosionLogic();

    if(finish>1000||document.getElementById("health").value == 0)
    {
        gameStarted = now;
        gameMinutes+=1;
        document.getElementById("time").innerHTML = 60-gameMinutes+ " s";
        if(gameMinutes==60)
        {
            document.getElementById("startButton").style.display="block";
            document.getElementById("startButton").disabled = false;
            document.getElementById("health").value = 100
            game=false;
            // for(dancer_i of dancers)
            // {
            //     scene.remove(dancer_i); 
                
            // }
            // dancers.splice(1, dancers.length)

            // for(enemies_i of enemies)
            // {
            //     scene.remove(enemies_i); 
                
            // }
            // enemies.splice(1, enemies.length)

            // for(shots_i of shots)
            // {
            //     scene.remove(shots_i); 
                
            // }
            // shots.splice(1, shots.length)
            
            // scene.remove(particles)
            // spaceship.position.z = 80;
            // spaceship.position.y = 2;
            // spaceship.position.x = 0;
            // counter = 0;
            
        }
    }
    // for(var i=0; i<shots.length; i++) {

    //     if(shots[i].position.z <= -130) 
    //     {
    //         scene.remove(shots[i])
    //         shots.splice(i, 1)
    //     }
    //     else
    //     {
    //         shots[i].rotation.set(Math.PI/2,0,0)
    //         shots[i].position.z -= 3
    //     }
    //   }
    for(var index=0; index<bullets.length; index+=1){
		if( bullets[index] === undefined ) continue;
		if( bullets[index].alive == false ){
			bullets.splice(index,1);
			continue;
		}
		console.log(bullets[index].position)
		bullets[index].position.add(bullets[index].velocity);
	}
	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	
	if(keyboard[37]){ // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]){ // right arrow key
		camera.rotation.y += player.turnSpeed;
	}
    // shoot a bullet
	if(keyboard[32] && player.canShoot <= 0)
	{ // spacebar key
		// creates a bullet as a Mesh object
		var bullet = new THREE.Mesh(
			new THREE.SphereGeometry(0.05,8,8),
			new THREE.MeshBasicMaterial({color:0xffffff})
		);
		// this is silly.
		// var bullet = models.pirateship.mesh.clone();
		
		// position the bullet to come from the player's weapon
		bullet.position.set(
			weapon.position.x,
			weapon.position.y + 0.15,
			weapon.position.z
		);
		// set the velocity of the bullet
		bullet.velocity = new THREE.Vector3(
		Math.sin(camera.rotation.y),
			0,
		-Math.cos(camera.rotation.y)
		);

		bullet.alive = true;
        setTimeout(function()
        {
			bullet.alive = false;
			scene.remove(bullet);
		}, 1000);
		
		// add to scene, array, and set the delay to 10 frames
		bullets.push(bullet);
		scene.add(bullet);
		player.canShoot = 10;
    }

	if(player.canShoot > 0) player.canShoot -= 1;
	
    // position the gun in front of the camera
	weapon.position.set(
		camera.position.x + 2 - Math.sin(camera.rotation.y + Math.PI/6) * 0.75,
		camera.position.y - 25 + Math.sin(time*4 + camera.position.x + camera.position.z)*0.01,
		camera.position.z  - 100 + Math.cos(camera.rotation.y + Math.PI/6) * 0.75
	);
	weapon.rotation.set(
		camera.rotation.x,
		camera.rotation.y ,
		camera.rotation.z
    );
    // console.log(weapon.position)
    // console.log(camera.position)
    
}
function run() 
{
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );
        if(game)
        {
            animate();
            // KF.update();
            // animator.start();

        }

}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "images/grass.png";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // // Turn on shadows
    renderer.shadowMap.enabled = true;
    // // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );

    camera.position.set(-96, player.height, 1246);
    camera.lookAt(new THREE.Vector3(-96,player.height,1246));

     scene.add(camera);
    // Create First Person Controls
    // controls = new THREE.PointerLockControls( camera );
    // scene.add( controls.getObject() );
    // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-20, 100, 0);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);

    // loadObj();
    // loadEnemy();
    // loadTree();
    addExplosion();
    loadLevel();
    loadEnemy();
    loadWeapon();
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    groupTree = new THREE.Object3D;
    root.add(groupTree);
    sphericalHelper = new THREE.Spherical();


    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(4, 4);

    var color = 0xffffff;

    // // // Put in a ground plane to show off the lighting
    // geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    // floor = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));
    // floor.rotation.x = -Math.PI / 2;
    // floor.position.y = -4.02;
    
    // // // Add the mesh to our group
    // group.add( floor );
 
    // floor.castShadow = false;
    // floor.receiveShadow = true;
    // Now add the group to our scene
    scene.add( root );

    // axes
	
	// var imagePrefix = "images/back-";
	// var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	// var imageSuffix = ".png";
	// var skyGeometry = new THREE.CubeGeometry( 230, 100, 200 );	
	// var loader = new THREE.TextureLoader();
	// var materialArray = [];
	// for (var i = 0; i < 6; i++)
	// 	materialArray.push( new THREE.MeshBasicMaterial({
	// 		map: loader.load( imagePrefix + directions[i] + imageSuffix ),
	// 		side: THREE.BackSide
	// 	}));
    // var skyBox = new THREE.Mesh( skyGeometry, materialArray );
    // skyBox.position.set(0,20,0)
	// scene.add( skyBox );
	
        
    // document.addEventListener( 'mousemove', onDocumentMouseMove );
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener( 'resize', onWindowResize);
    // initAnimations();
}
function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// function playAnimations()
// {    
  
//     animator = new KF.KeyFrameAnimator;
//     animator.init({ 
//             interps:
//                 [
//                     { 
//                         keys:[0, 1], 
//                         values:[
//                                 { x : 0, y : 0 },
//                                 { x : 0, y : 1 },
//                                 ],
//                         target:floor.material.map.offset
//                     },
//                 ],
//             loop: loopAnimation,
//             duration1:duration,
//         });
            
// }

function doExplosionLogic()
{
	if(!particles.visible)return;
	for (var i = 0; i < particleCount; i ++ ) {
		particleGeometry.vertices[i].multiplyScalar(explosionPower);
	}
	if(explosionPower>1.005){
		explosionPower-=0.001;
	}else{
		particles.visible=false;
	}
	particleGeometry.verticesNeedUpdate = true;
}
function explode(x,y,z)
{
	particles.position.y=y;
	particles.position.z=z;
	particles.position.x=x;
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = -0.2+Math.random() * 0.4;
		vertex.y = -0.2+Math.random() * 0.4 ;
		vertex.z = -0.2+Math.random() * 0.4;
		particleGeometry.vertices[i]=vertex;
	}
	explosionPower=1.07;
	particles.visible=true;
}
function addExplosion(){
	particleGeometry = new THREE.Geometry();
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		particleGeometry.vertices.push( vertex );
	}
	var pMaterial = new THREE.PointsMaterial({
	  color: 0xC7C2BA,
	  size: .5
	});
	particles = new THREE.Points( particleGeometry, pMaterial );
	scene.add( particles );
	particles.visible=false;
}
function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}