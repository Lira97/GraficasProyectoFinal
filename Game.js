var renderer = null, 
scene = null,raycaster , 
camera = null,
root = null,
group = null,groupTree=null,
orbitControls = null;
var game = false;
var crashBuilding= 0;
var floor;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var raycaster;
var projector

var map = [ // 1  2  3  4  5  6  7  8  9
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
	[1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1], // 1
	[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
	[1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1], // 3
	[1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1], // 4
	[1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1], // 5
	[1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 6
	[1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1], // 7
	[1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1], // 8
	[1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1], // 9
	[1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1], // 10
	[1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1], // 11
	[1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1], // 12
	[1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1], // 13
	[1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 14
	[1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1], // 14
	[1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1], // 14
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 14
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1], // 10
    ], mapW = map.length, mapH = map[0].length;

// Semi-constants
var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight,
	ASPECT = WIDTH / HEIGHT,
	UNITSIZE = 100,
	WALLHEIGHT = UNITSIZE / 3,
	MOVESPEED = 200,
	LOOKSPEED = 0.075,
	BULLETMOVESPEED = MOVESPEED * 5,
	NUMAI = 5,
	PROJECTILEDAMAGE = 20;
// Global vars
var t = THREE, scene, renderer, controls, clock, projector, model, skin;
var runAnim = true, mouse = { x: 0, y: 0 }, kills = 0, health = 100;
var healthCube, lastHealthPickup = 0;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();


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

var objects = []
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

function loadjson()
{

        
        var objLoader = new THREE.OBJLoader();
        
        // objLoader.setMaterials(materials);
        objLoader.load('models/map.json', function(mesh)
        {
            var testarray = [];

            
            mesh.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {

                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            }); 
          
            map = mesh  
            map.scale.set(.5,.5,.5);
            map.position.x = 100;
            map.position.y = -35;
            map.position.z = -1200;
            objects.push( map );
            group.add(map);
        });
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
            var testarray = [];

            
            mesh.traverse( function ( child ) 
            {
                testarray.push( child );
                child.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

                if ( child instanceof THREE.Mesh ) 
                {

                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            }); 
            console.log(testarray[1]) 
            map = mesh  
            map.scale.set(.5,.5,.5);
            map.position.x = 100;
            map.position.y = -35;
            map.position.z = -1200;
            objects.push( map );
            group.add(map);
        });
    });  
}
function loadWeapon()
{

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
            weapon.scale.set(.05,.05,.05);
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

function bullet()
{
    var geometry =new THREE.SphereGeometry(0.5,8,8);
    var material = new THREE.MeshBasicMaterial({color:0x7200ff})
    var shot = new THREE.Mesh( geometry, material );
    shot.position.set(
        controls.getObject().position.x + 5,
        controls.getObject().position.y - 2,
        controls.getObject().position.z
    );
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
    
    // if(controls.getObject().bbox.intersectsBox(map.bbox))
    // {
    //     console.log('pega')  
    // }
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
    // for(var index=0; index<bullets.length; index+=1){
	// 	if( bullets[index] === undefined ) continue;
    // 	if( bullets[index].alive == false )
    //{
	// 		bullets.splice(index,1);
	// 		continue;
	// 	}
	// 	console.log(bullets[index].position)
	// 	bullets[index].position.add(bullets[index].velocity);
	// }


	// if(keyboard[32] && player.canShoot <= 0)
	// { // spacebar key
	// 	// creates a bullet as a Mesh object
	// 	var bullet = new THREE.Mesh(
	// 		new THREE.SphereGeometry(0.05,8,8),
	// 		new THREE.MeshBasicMaterial({color:0xffffff})
	// 	);
	// 	// this is silly.
	// 	// var bullet = models.pirateship.mesh.clone();
		
	// 	// position the bullet to come from the player's weapon
	// 	bullet.position.set(
	// 		weapon.position.x,
	// 		weapon.position.y + 0.15,
	// 		weapon.position.z
	// 	);
	// 	// set the velocity of the bullet
	// 	bullet.velocity = new THREE.Vector3(
	// 	Math.sin(controls.getObject().rotation.y),
	// 		0,
	// 	-Math.cos(controls.getObject().rotation.y)
	// 	);

	// 	bullet.alive = true;
    //     setTimeout(function()
    //     {
	// 		bullet.alive = false;
	// 		scene.remove(bullet);
	// 	}, 1000);
		
	// 	// add to scene, array, and set the delay to 10 frames
	// 	bullets.push(bullet);
	// 	scene.add(bullet);
	// 	player.canShoot = 10;
    // }

	// if(player.canShoot > 0) player.canShoot -= 1;
	
    // // position the gun in front of the camera
	// weapon.position.set(
	// 	controls.getObject().position.x - Math.sin(controls.getObject().rotation.y + Math.PI/6) * 0.75,
	// 	controls.getObject().position.y - .5 + Math.sin( controls.getObject().position.x + controls.getObject().position.z)*0.01,
	// 	controls.getObject().position.z - 3  + Math.cos(controls.getObject().rotation.y + Math.PI/6) * 0.75
	// );
	// weapon.rotation.set(
    //     controls.getObject().rotation.x,
	// 	controls.getObject().rotation.y ,
	// 	controls.getObject().rotation.z
    // );

    for(var i=0; i<shots.length; i++) {
        if( shots[i] === undefined ) continue;
        if( shots[i].alive == false )
        {
			shots.splice(i,1);
			continue;
        }
        shots[i].position.add(shots[i].velocity);
      }
    
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
            // if ( controls.isLocked === true ) {
                // raycaster.ray.origin.copy( controls.getObject().position );
				// raycaster.ray.origin.y -= 10;

                // var intersections = raycaster.intersectObjects( objects );
                // console.log(intersections)
                // var onObject = intersections.length > 0;
                controls.getObject().bbox.setFromObject(controls.getObject())
                var time = performance.now();
                var delta = ( time - prevTime ) / 1000;

                velocity.x -= velocity.x * 5 * delta;
                velocity.z -= velocity.z * 5 * delta;

                velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

                direction.z = Number( moveForward ) - Number( moveBackward );
                direction.x = Number( moveLeft ) - Number( moveRight );
                direction.normalize(); // this ensures consistent movements in all directions

                if ( moveForward || moveBackward )velocity.z -= direction.z * 400.0 * delta;
                 
    
                if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

                controls.getObject().translateX( velocity.x * delta );
                controls.getObject().translateY( velocity.y * delta );
                controls.getObject().translateZ( velocity.z * delta );

                if ( controls.getObject().position.y < UNITSIZE * .2 ) 
                {

                    velocity.y = 0;
                    controls.getObject().position.y = UNITSIZE * .2;
                }
                prevTime = time;

            }
        // }

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
	scene.fog = new t.FogExp2(0xD6F1FF, 0.0005); // color, density

    // Add  a camera so we can view the scene
     camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    // camera = new THREE.PerspectiveCamera(60, ASPECT, 1, 10000);
    // camera.position.x = -96;
    // camera.position.z =1246;
    // camera.position.set(0,0,0)
    setupScene();
    controls = new THREE.PointerLockControls( camera , renderer.domElement);
    controls.getObject().bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    controls.getObject().position.x = -811;
    controls.getObject().position.y = UNITSIZE * .2;
    controls.getObject().position.z = -251;

    var blocker = document.getElementById( 'container' );

    blocker.addEventListener( 'click', function () {

					controls.lock();

                }, false );

    controls.addEventListener( 'lock', function () {

    } );

	controls.addEventListener( 'unlock', function () {

    } );

              
    scene.add( controls.getObject() );

    var onKeyDown = function ( event ) 
    {

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = true;

                break;

            case 37: // left
            case 65: // a
                moveLeft = true;

                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                
                break;

            case 32: // space
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;

        }

    };

    var onKeyUp = function ( event ) {

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }

    };

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );


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

    addExplosion();
    // loadLevel();
    // //loadjson();
    // loadEnemy();
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
    window.addEventListener( 'keydown', onKeyDown, false );
    window.addEventListener( 'keyup', onKeyUp, false );
    // window.addEventListener('keydown', keyDown);
    // window.addEventListener('keyup', keyUp);
    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'mousemove', onDocumentMouseMove, false );
    $(document).click(function(e) {
		e.preventDefault;
        if (e.which === 1) { // Left click only
            var shot = bullet()
            shot.alive = true;
            setTimeout(function()
            {
            shot.alive = false;
            scene.remove(shot);
        }, 3000);
            shot.velocity = new THREE.Vector3(
                -Math.sin( controls.getObject().rotation.y),
                0,
                -Math.cos( controls.getObject().rotation.y)
            );
            shots.push(shot)
            scene.add(shot)
		}
	});

    // initAnimations();
}
function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove(e) {
	e.preventDefault();
	mouse.x = (e.clientX / WIDTH) * 2 - 1;
	mouse.y = - (e.clientY / HEIGHT) * 2 + 1;
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

function setupScene() 
{
	var UNITSIZE = 100, units = mapW;

	// Geometry: floor
	var floor = new t.Mesh(
			new t.CubeGeometry(units * UNITSIZE, 10, units * UNITSIZE),
			new t.MeshLambertMaterial({color: 606060,map: t.ImageUtils.loadTexture('images/floor2.PNG')})
	);
	var celing = new t.Mesh(
		new t.CubeGeometry(units * UNITSIZE, 10, units * UNITSIZE),
		new t.MeshLambertMaterial({color: 606060,map: t.ImageUtils.loadTexture('images/floor2.PNG')})
		);
	celing.position.set(0,40,0)
	scene.add(floor);
	scene.add(celing);
	console.log(floor.position)

	console.log(celing.position)
	// Geometry: walls
	var cube = new t.CubeGeometry(UNITSIZE, WALLHEIGHT, UNITSIZE);
	var materials = [
	                 new t.MeshLambertMaterial({color: 0xffefd8,map: t.ImageUtils.loadTexture('images/w.png')}),
	                 new t.MeshLambertMaterial({/*color: 0xC5EDA0,*/map: t.ImageUtils.loadTexture('images/door.png')}),
	                 new t.MeshLambertMaterial({color: 0xFBEBCD}),
	                 ];
	for (var i = 0; i < mapW; i++) {
		for (var j = 0, m = map[i].length; j < m; j++) {
			if (map[i][j]) 
			{
				var wall = new t.Mesh(cube, materials[map[i][j]-1]);
				wall.position.x = (i - units/2) * UNITSIZE;
				wall.position.y = WALLHEIGHT/2;
				wall.position.z = (j - units/2) * UNITSIZE;
				scene.add(wall);
			}
		}
	}
	
	// Health cube
	healthcube = new t.Mesh(
			new t.CubeGeometry(30, 30, 30),
			new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/health.png')})
	);
	healthcube.position.set(-UNITSIZE-15, 35, -UNITSIZE-15);
	scene.add(healthcube);
	
	// Lighting
	var directionalLight1 = new t.DirectionalLight( 0xF7EFBE, 0.7 );
	directionalLight1.position.set( 0.5, 1, 0.5 );
	scene.add( directionalLight1 );
	var directionalLight2 = new t.DirectionalLight( 0xF7EFBE, 0.5 );
	directionalLight2.position.set( -0.5, -1, -0.5 );
	scene.add( directionalLight2 );
}
var bullets = [];
var sphereMaterial = new t.MeshBasicMaterial({color: 0x333333});
var sphereGeo = new t.SphereGeometry(2, 6, 6);

