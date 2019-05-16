/**
 * Notes:
 * - Coordinates are specified as (X, Y, Z) where X and Z are horizontal and Y
 *   is vertical
 */
var particleGeometry;
var particleCount=20;
var explosionPower =1.06;
var door
var KeyE
var duration = 20000; // ms
var helper;
var effect
var ready = false;
var robot_idle = null
var robots = [];
var robot_mixers = [];
var robots_animations = [];
var listener = new THREE.AudioListener();
var mixer = null;
var dancer = null;
var currentTime = Date.now();

// create a global audio source
var sound = new THREE.Audio( listener );


var animator = null,
duration1 = 1,
loopAnimation = false;
var map = [ // 1  2  3  4  5  6  7  8  9
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
	[1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1], // 6
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 10
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 11
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 12
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 13
	[1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1], // 14
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 14
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 14
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 14
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 10
    ], mapW = map.length, mapH = map[0].length;

// Semi-constants
var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight,
	ASPECT = WIDTH / HEIGHT,
	UNITSIZE = 250,
	WALLHEIGHT = UNITSIZE,
	MOVESPEED = 200,
	SPEEDENEMY = 10,
	LOOKSPEED = 0.075,
	BULLETMOVESPEED = MOVESPEED * 5,
	NUMAI = 10,
	PROJECTILEDAMAGE = 20;
// Global vars
var scene = null
var t = THREE, cam, renderer, controls, clock, projector, model, skin;
var runAnim = true, mouse = { x: 0, y: 0 }, kills = 0, health = 100;
var healthCube, lastHealthPickup = 0;
/*
var finder = new PF.AStarFinder({ // Defaults to Manhattan heuristic
	allowDiagonal: true,
}), grid = new PF.Grid(mapW, mapH, map);
*/

// Initialize and run on document ready
$(document).ready(function() {
	$('body').append('<div id="level2">Click to start</div>');
	$('#level2').css({width: WIDTH, height: HEIGHT}).one('click', function(e) {
		e.preventDefault();
		$(this).fadeOut();
		init();
		setInterval(drawRadar, 1000);
		animate();
	});
	/*
	new t.ColladaLoader().load('models/Yoshi/Yoshi.dae', function(collada) {
		model = collada.scene;
		skin = collada.skins[0];
		model.scale.set(0.2, 0.2, 0.2);
		model.position.set(0, 5, 0);
		scene.add(model);
	});
	*/
});

// Setup
function init() {
	clock = new t.Clock(); // Used in render() for controls.update()
	projector = new t.Projector(); // Used in bullet projection
	scene = new t.Scene(); // Holds all objects in the canvas
	// scene.fog = new t.FogExp2(0xD6F1FF, 0.0005); // color, density

	// Set up camera
	cam = new t.PerspectiveCamera(60, ASPECT, 1, 10000); // FOV, aspect, near, far
	cam.position.y = UNITSIZE * .2;
	cam.position.x = -2058;
	cam.position.z = -623;

	scene.add(cam);

	// Camera moves with mouse, flies around with WASD/arrow keys
	controls = new t.FirstPersonControls(cam);
	controls.movementSpeed = MOVESPEED;
	controls.lookSpeed = LOOKSPEED;
	controls.lookVertical = false; // Temporary solution; play on flat surfaces only
	controls.noFly = true;

	// World objects
	setupScene();

	// Artificial Intelligence
	loadFBX()
	loadPortal()
	cam.add( listener );

	addSound();

	var light = new THREE.PointLight( 0xff0000, 1, 100 );
	light.position.set( -239.3,20,-2058 );
	// Handle drawing as WebGL (faster than Canvas but less supported)
	renderer = new t.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);

	// Add the canvas to the document
	renderer.domElement.style.backgroundColor = '#D6F1FF'; // easier to see
	document.body.appendChild(renderer.domElement);

	// Track mouse position so we know where to shoot
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	// Shoot on click
	$(document).click(function(e) {
		e.preventDefault;
		if (e.which === 1) { // Left click only
			createBullet();
		}
	});

	// // Display HUD
	$('body').append('<canvas id="radar" width="200" height="200"></canvas>');
	$('body').append('<div id="hud"><p>Health: <span id="health">100</span><br />Score: <span id="score">0</span></p></div>');
	// $('body').append('<div id="credits"><p>Created by <a href="http://www.isaacsukin.com/">Isaac Sukin</a> using <a href="http://mrdoob.github.com/three.js/">Three.js</a><br />WASD to move, mouse to look, click to shoot</p></div>');

	// Set up "hurt" flash
	document.getElementById("healthText").style.display="block";
	document.getElementById("healthText").disabled = true;
	document.getElementById("health").style.display="block";
	document.getElementById("health").disabled = true;
	$('body').append('<div id="hurt"></div>');
	$('#hurt').css({width: WIDTH, height: HEIGHT,});
	document.addEventListener("keydown", onDocumentKeyDown, false);

}

// Helper function for browser frames
function animate() {
	if (runAnim) {
		requestAnimationFrame(animate);
	}
	render();
}

// Update and display
function render() {
	var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
	var delta = clock.getDelta(), speed = delta * BULLETMOVESPEED;
	var aispeed = delta * SPEEDENEMY;
	controls.update(delta); // Move camera
	if ( ready )
	{
		helper.update( delta );
	}

	if ( ai.length > 0) {
		for(dancer_i of ai){
			if(distance(dancer_i.position.x, dancer_i.position.z, cam.position.x, cam.position.z) < 90){
				health -= 0.1;		
				action = dancer_i.mixer.clipAction(dancer_i.animations[ 15 ], dancer_i);
				action.play();
				setTimeout(function () {
					action.stop();
					action = dancer_i.mixer.clipAction( dancer_i.animations[ 14 ], dancer_i );
				}, 1600);
				break
			}
			 var action = dancer_i.mixer.clipAction( dancer_i.animations[ 14 ], dancer_i );
			 action.play();
			dancer_i.mixer.update( ( deltat ) * 0.001 );

		}
	}
	// Update bullets. Walk backwards through the list so we can remove items.
	for (var i = bullets.length-1; i >= 0; i--) {
		var b = bullets[i], p = b.position, d = b.ray.direction;
		if (checkWallCollision(p))
		{
			bullets.splice(i, 1);
			scene.remove(b);
			continue;
		}
		// Collide with AI
		var hit = false;
		for (var j = ai.length-1; j >= 0; j--)
		{
			var a = ai[j];
			// var v = a.geometry.vertices[0];
			var c = a.position;
			// console.log(distance(c.x, c.z, cam.position.x, cam.position.z) )
			// var x = Math.abs(v.x), z = Math.abs(v.z);
			//console.log(Math.round(p.x), Math.round(p.z), c.x, c.z, x, z);
			if (p.x < c.x + 300 && p.x > c.x - 300 &&
				p.z < c.z + 300 && p.z > c.z - 300  && b.owner != a)
			{
				bullets.splice(i, 1);
				scene.remove(b);
				a.health -= PROJECTILEDAMAGE;
				hit = true;
				break;
			}
		}
		// Bullet hits player
		
		// if (distance(c.x, c.z, cam.position.x, cam.position.z) < 25 && b.owner != cam) {
		// 	$('#hurt').fadeIn(75);
		// 	health -= 10;
		// 	if (health < 0) health = 0;
		// 	val = health < 25 ? '<span style="color: darkRed">' + health + '</span>' : health;
		// 	$('#health').html(val);
		// 	bullets.splice(i, 1);
		// 	scene.remove(b);
		// 	$('#hurt').fadeOut(350);

		// }
		if (!hit)
		{
			b.translateX(speed * d.x);
			//bullets[i].translateY(speed * bullets[i].direction.y);
			b.translateZ(speed * d.z);
		}
	}

	// Update AI.
	for (var i = ai.length-1; i >= 0; i--)
	{
		
		var a = ai[i];
		if (a.health <= 0)
		{	
			var action = a.mixer.clipAction( a.animations[ 5 ], a );
			action.play();	
			a.mixer.update( ( deltat ) * 0.0001 );
			Muelte(i,a)

			
		}
		// Move AI

		
		var r = Math.random();
		if (r > 0.995)
		{
			a.lastRandomX = Math.random() * 2 - 1;
			a.lastRandomZ = Math.random() * 2 - 1;
			console.log(a.lastRandomX)

		}
		var c = getMapSector(a.position);

		if (c.x < 0 || c.x >= mapW || c.y < 0 || c.y >= mapH || checkWallCollision(a.position))
		{
			// a.translateX(-2 * aispeed * a.lastRandomX);
			a.translateZ(-2 * aispeed * a.lastRandomZ);
			a.lastRandomX = Math.random() * 2 - 1;
			a.lastRandomZ = Math.random() * 2 - 1;
		}

		if (c.x < -1 || c.x > mapW || c.z < -1 || c.z > mapH)
		{
			ai.splice(i, 1);
			scene.remove(a);
		}
		
		a.rotation.y = Math.atan2( ( cam.position.x - a.position.x ), ( cam.position.z - a.position.z ) );
		a.translateZ(aispeed * a.lastRandomZ);
		// a.translateX(aispeed * a.lastRandomX);
		// a.lookAt(cam.position);
        // a.translateZ(.5);



		var cc = getMapSector(cam.position);
		if (Date.now() > a.lastShot + 750 && distance(c.x, c.z, cc.x, cc.z) < 2) {
			createBullet(a);
			a.lastShot = Date.now();
		}

	}

	renderer.render(scene, cam); // Repaint

	// Death
	// if (health <= 0) {
	// 	runAnim = false;
	// 	$(renderer.domElement).fadeOut();
	// 	$('#radar, #hud, #credits').fadeOut();
	// 	$('#intro').fadeIn();
	// 	$('#intro').html('Ouch! Click to restart...');
	// 	$('#intro').one('click', function() {
	// 		location = location;
	// 		/*
	// 		$(renderer.domElement).fadeIn();
	// 		$('#radar, #hud, #credits').fadeIn();
	// 		$(this).fadeOut();
	// 		runAnim = true;
	// 		animate();
	// 		health = 100;
	// 		$('#health').html(health);
	// 		kills--;
	// 		if (kills <= 0) kills = 0;
	// 		$('#score').html(kills * 100);
	// 		cam.translateX(-cam.position.x);
	// 		cam.translateZ(-cam.position.z);
	// 		*/
	// 	});
	// }
}

// Set up the objects in the world
function setupScene()
{
	var UNITSIZE = 250, units = mapW;

	// Geometry: floor
	var floor = new t.Mesh(
			new t.CubeGeometry(units * UNITSIZE, 10, units * UNITSIZE),
			new t.MeshLambertMaterial({color: 0x974807,map: t.ImageUtils.loadTexture('images/floor3.jpg')})
	);
	var celing = new t.Mesh(
		new t.CubeGeometry(units * UNITSIZE, 10, units * UNITSIZE),
		new t.MeshLambertMaterial({color: 606060,map: t.ImageUtils.loadTexture('images/floor2.PNG')})
		);
	celing.position.set(0,90,0)
	scene.add(floor);
	//  scene.add(celing);
	// console.log(floor.position)
	// console.log(cam.position)

	// console.log(celing.position)
	// Geometry: walls
	var cube = new t.CubeGeometry(UNITSIZE, WALLHEIGHT, UNITSIZE);
	var materials = [
	                 new t.MeshLambertMaterial({color: 0xffefd8,map: t.ImageUtils.loadTexture('images/w.png')}),
					 new t.MeshLambertMaterial({color: 0xFBEBCD}),
					 new t.MeshLambertMaterial({/*color: 0xC5EDA0,*/map: t.ImageUtils.loadTexture('images/door.png')}),

	                 ];
	for (var i = 0; i < mapW; i++) {
		for (var j = 0, m = map[i].length; j < m; j++) {
			if (map[i][j])
			{
				if(map[i][j] == 2)
				{
					door = new t.Mesh(cube, materials[map[i][j]-1]);
					door.position.x = (i - units/2) * UNITSIZE;
					door.position.y = WALLHEIGHT/2;
					door.position.z = (j - units/2) * UNITSIZE;
					door.open = false
					scene.add(door);

				}
				else if (map[i][j] == 2)
				{
					loadRock((i - units/2) * UNITSIZE,WALLHEIGHT/2,(j - units/2) * UNITSIZE)
	

				}
				else{
					var wall = new t.Mesh(cube, materials[map[i][j]-1]);
					wall.position.x = (i - units/2) * UNITSIZE;
					wall.position.y = WALLHEIGHT/2;
					wall.position.z = (j - units/2) * UNITSIZE;
					scene.add(wall);
				}

			}
		}
	}


	// Lighting
	var directionalLight1 = new t.DirectionalLight( 0xF7EFBE, 0.7 );
	directionalLight1.position.set( 0.5, 1, 0.5 );
	scene.add( directionalLight1 );
	var directionalLight2 = new t.DirectionalLight( 0xF7EFBE, 0.5 );
	directionalLight2.position.set( -0.5, -1, -0.5 );
	scene.add( directionalLight2 );

	var imagePrefix = "images/SkyboxLevel3/";
	var directions  = ["1", "2", "3", "4", "5", "6"];
	var imageSuffix = ".png";
	var skyGeometry = new THREE.CubeGeometry( 9000, 9000, 9000 );
	var loader = new THREE.TextureLoader();
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: loader.load( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
    var skyBox = new THREE.Mesh( skyGeometry, materialArray );
	// skyBox.position.set(0,0,0)
	// x: 2125, y: 41.666666666666664, z: 875
	scene.add( skyBox );

}

var ai = [];
var aiGeo = new t.CubeGeometry(40, 40, 40);


function getAIpath(a) {
	var p = getMapSector(a.position);
	do { // Cop-out
		do {
			var x = getRandBetween(0, mapW-1);
			var z = getRandBetween(0, mapH-1);
		} while (map[x][z] > 0 || distance(p.x, p.z, x, z) < 3);
		var path = findAIpath(p.x, p.z, x, z);
	} while (path.length == 0);
	return path;
}

/**
 * Find a path from one grid cell to another.
 *
 * @param sX
 *   Starting grid x-coordinate.
 * @param sZ
 *   Starting grid z-coordinate.
 * @param eX
 *   Ending grid x-coordinate.
 * @param eZ
 *   Ending grid z-coordinate.
 * @returns
 *   An array of coordinates including the start and end positions representing
 *   the path from the starting cell to the ending cell.
 */
function findAIpath(sX, sZ, eX, eZ) {
	var backupGrid = grid.clone();
	var path = finder.findPath(sX, sZ, eX, eZ, grid);
	grid = backupGrid;
	return path;
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

function getMapSector(v) {
	var x = Math.floor((v.x + UNITSIZE / 2) / UNITSIZE + mapW/2);
	var z = Math.floor((v.z + UNITSIZE / 2) / UNITSIZE + mapW/2);
	return {x: x, z: z};
}

/**
 * Check whether a Vector3 overlaps with a wall.
 *
 * @param v
 *   A THREE.Vector3 object representing a point in space.
 *   Passing cam.position is especially useful.
 * @returns {Boolean}
 *   true if the vector is inside a wall; false otherwise.
 */
function checkWallCollision(v) {
	var c = getMapSector(v);
	return map[c.x][c.z] > 0;
}

// Radar
function drawRadar() {
	var c = getMapSector(cam.position), context = document.getElementById('radar').getContext('2d');
	context.font = '10px Helvetica';
	for (var i = 0; i < mapW; i++) {
		for (var j = 0, m = map[i].length; j < m; j++) {
			var d = 0;
			for (var k = 0, n = ai.length; k < n; k++)
			{
				var e = getMapSector(ai[k].position);
				if (i == e.x && j == e.z) {
					d++;
				}
			}
			if (i == c.x && j == c.z && d == 0)
			{
				context.fillStyle = '#0000FF';
				context.fillRect(i * 11, j * 11, (i+1)*10, (j+1)*25);
			}
			else if (i == c.x && j == c.z) {
				context.fillStyle = '#AA33FF';
				context.fillRect(i * 11, j * 11, (i+1)*10, (j+1)*25);
				// context.fillStyle = '#000000';
				// context.fillText(''+d, i*12+8, j*12+12);
			}
			else if (d > 0 && d < 12) {
				context.fillStyle = '#FF0000';
				context.fillRect(i * 11, j * 11, (i+1)*10, (j+1)*25);
				// context.fillStyle = '#000000';
				// context.fillText(''+d, i*12+8, j*12+12);
			}
			else if (map[i][j] > 0) {
				context.fillStyle = '#666666';
				context.fillRect(i * 11, j * 11, (i+1)*25, (j+1)*25);
			}
			else {
				context.fillStyle = '#CCCCCC';
				context.fillRect(i * 11, j * 11, (i+1)*25, (j+1)*25);
			}
		}
	}
}

var bullets = [];
var sphereMaterial = new t.MeshBasicMaterial({color: 0x333333});
var sphereGeo = new t.SphereGeometry(2, 6, 6);
function createBullet(obj) {
	if (obj === undefined) {
		obj = cam;
	}
	var sphere = new t.Mesh(sphereGeo, sphereMaterial);
	sphere.position.set(obj.position.x, obj.position.y * 0.8, obj.position.z);

	if (obj instanceof t.Camera)
	{
		var vector = new t.Vector3(mouse.x, mouse.y, 1);
		projector.unprojectVector(vector, obj);
		sphere.ray = new t.Ray(
				obj.position,
				vector.sub(obj.position).normalize()
		);
	}
	else {
		var vector = cam.position.clone();
		sphere.ray = new t.Ray(
				obj.position,
				vector.sub(obj.position).normalize()
		);
	}
	sphere.owner = obj;

	bullets.push(sphere);
	scene.add(sphere);

	return sphere;
}

function onDocumentMouseMove(e) {
	e.preventDefault();
	mouse.x = (e.clientX / WIDTH) * 2 - 1;
	mouse.y = - (e.clientY / HEIGHT) * 2 + 1;
}

// Handle window resizing
$(window).resize(function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	ASPECT = WIDTH / HEIGHT;
	if (cam) {
		cam.aspect = ASPECT;
		cam.updateProjectionMatrix();
	}
	if (renderer) {
		renderer.setSize(WIDTH, HEIGHT);
	}
	$('#intro, #hurt').css({width: WIDTH, height: HEIGHT,});
});

// Stop moving around when the window is unfocused (keeps my sanity!)
$(window).focus(function() {
	if (controls) controls.freeze = false;
});
$(window).blur(function() {
	if (controls) controls.freeze = true;
});

//Get a random integer between lo and hi, inclusive.
//Assumes lo and hi are integers and lo is lower than hi.
function getRandBetween(lo, hi) {
 return parseInt(Math.floor(Math.random()*(hi-lo+1))+lo, 10);
}

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
	explosionPower=1.2;
	particles.visible=true;
}
function addExplosion(){
	particleGeometry = new THREE.Geometry();
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		particleGeometry.vertices.push( vertex );
	}
	var pMaterial = new THREE.PointsMaterial({
	  color: 0x74F016,
	  size: 5
	});
	particles = new THREE.Points( particleGeometry, pMaterial );
	scene.add( particles );
	particles.visible=false;
}

function initAnimations()
{
    animator = new KF.KeyFrameAnimator;
    animator.init({
        interps:
            [
                {
                    keys:[0, .30, .60, 1],
                    values:[
                            { x:0, y : 0, z : 0 },
                            { x:0 , y : Math.PI/4, z : 0 },
                            { x:0 , y : Math.PI/2 , z : 0},
                            { x:0, y : Math.PI , z : 0 },
                            ],
                },
            ],
        loop: loopAnimation,
        duration1:duration,
    });

}

function playAnimations()
{
    animator.start();
}
function onDocumentKeyDown(event) {
	var keyCode = event.which;
	if (keyCode == 69 )
	{
		KeyE = true

	}
	else
	{
		KeyE = false

	}

};

function ChangeLevel(open) {
    setTimeout(function () {
        if (open) {
			$('body').append('<div id="credits"><a href="Menu.html"> </a></div>');
        }
    }, 2000);
}


function addSound()
{
	var loader = new THREE.AudioLoader();
	loader.load( 'sound/finalBoss.mp3', function ( buffer )
    {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.5 );
		sound.play();

        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );

        });
}

function loadPortal()
{
	var c = getMapSector(cam.position);
    var loader = new THREE.FBXLoader();
    loader.load( 'Portal/source/portal.fbx', function ( object )
    {

        var texture = new THREE.TextureLoader().load('Portal/textures/map.jpeg');
        var normalMap = new THREE.TextureLoader().load('Portal/textures/normal.jpeg');

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
        enemy.scale.set(.38,.38,.38);

		enemy.position.y = UNITSIZE * .17;
		enemy.position.x = 1990;
		enemy.position.z = -619;
		enemy.rotation.y = Math.PI/2;
		scene.add(enemy);
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );

        });
}
function clone ()
{
	var c = getMapSector(cam.position);
	var newDancer = cloneFbx(dancer);
	newDancer.mixer =  new THREE.AnimationMixer( scene );
	var action = newDancer.mixer.clipAction( newDancer.animations[ 14 ], newDancer );
	action.play();

	do {
		var x = getRandBetween(0, mapW-1);
		var z = getRandBetween(0, mapH-1);
	} while (map[x][z] > 0 || (x == c.x && z == c.z));
		x = Math.floor(x - mapW/2) * UNITSIZE;
		z = Math.floor(z - mapW/2) * UNITSIZE;

		newDancer.position.set(x, 3, z);
		newDancer.health = 100;
		newDancer.pathPos = 1;
		newDancer.lastRandomX = Math.random();
		newDancer.lastRandomZ = Math.random();
		// newDancer.lastShot = Date.now(); // Higher-fidelity timers aren't a big deal here.
		ai.push(newDancer);
		scene.add(newDancer);


}
function loadFBX()
{
	var c = getMapSector(cam.position);

    mixer = new THREE.AnimationMixer( scene );

    var loader = new THREE.FBXLoader();
    loader.load( 'models/tfc2/tfc2.fbx', function ( object )
    {

        object.mixer = new THREE.AnimationMixer( scene );
        var action = object.mixer.clipAction( object.animations[ 14 ], object );
		object.scale.set(100, 100, 100);
		do {
			var x = getRandBetween(0, mapW-1);
			var z = getRandBetween(0, mapH-1);
		} while (map[x][z] > 0 || (x == c.x && z == c.z));
			x = Math.floor(x - mapW/2) * UNITSIZE;
			z = Math.floor(z - mapW/2) * UNITSIZE;
			object.position.set(x, 3, z);
			object.health = 100000;
			object.pathPos = 1;
			object.lastRandomX = Math.random();
			object.lastRandomZ = Math.random();
		action.play();
		var texture = new THREE.TextureLoader().load('models/tfc2/thc7_Base_Color.png');
        var normalMap = new THREE.TextureLoader().load('models/tfc2/thc7_normal_base.png');

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
        console.log(object.animations);

       	dancer = object;
    	ai.push(dancer);
        scene.add( object );
    } );
}
function Muelte(i,a) {
	a.position = a.position	
    setTimeout(function () {
		a.rotation.x = -70
		ai.splice(i, 1);			
		kills++;
		$('#score').html(kills * 100);
	}, 3000);
	
}
