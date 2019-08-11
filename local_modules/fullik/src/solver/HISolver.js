//import { NONE, GLOBAL_ROTOR, GLOBAL_HINGE, LOCAL_ROTOR, LOCAL_HINGE, J_BALL, J_GLOBAL, J_LOCAL } from '../constants.js';
import { _Math } from '../math/Math.js';
import { V2 } from '../math/V2.js';
import { Structure2D } from '../core/Structure2D.js';
import { Chain2D } from '../core/Chain2D.js';
import { Bone2D } from '../core/Bone2D.js';


function HISolver ( o ) {



	this.startBones = null;
	this.endBones = null;

	this.scene = o.scene;

    this.target = null;
    this.goal = null;
    this.swivelAngle = 0;

    this.iteration = 15;

    this.thresholds = { position:0.1, rotation:0.1 };

    this.solver = new FIK.Structure2D(this.scene);
    //this.chain = null;

    this.bones = [];
    this.numBones = 0;

    this.rotation = [];



    this.initStructure( o );

}

Object.assign( HISolver.prototype, {

	isHISolver: true,

	initStructure: function ( o ) {

		this.startBones = o.start;
		this.endBones = o.end;
		this.angles = o.angles;

		var bone = this.startBones, next = bone.children[0];

		this.bones.push(bone);

		for (var i = 0; i<100; i++) {
            
            this.bones.push(next);
			if( next === this.endBones ) { this.createChain(); break }

			bone = next;
			
			next = bone.children[0];

		}

	},

	createChain: function () {

		this.numBones = this.bones.length;
		var chain = new Chain2D();
		//chain.embeddedTarget = new V2();
        //chain.useEmbeddedTarget = true;
        chain.setFixedBaseMode(true);  
        chain.setBaseboneConstraintType( FIK.LOCAL_ABSOLUTE );

        this.fakeBone = new Bone2D( new V2(0, -1), new V2(0, 0) );

		this.target = new THREE.Vector3();

		var base = new THREE.Vector3();
		var p0 = new THREE.Vector3();
		var p1 = new THREE.Vector3();
		var uv = new V2();
		var lng = 0

	    for (var i = 0; i<this.numBones; i++) {

	    	if( i > 0 ){ 
	    		this.target.add( this.bones[i].position );
	    		lng = base.distanceTo( this.bones[i].position );
	    		this.bones[i-1].getWorldPosition( p0 );
	    		this.bones[i].getWorldPosition( p1 );
	    		p1.sub( p0 ).normalize();


	    		if(p1.z === 0 ) uv.set( p1.x, p1.y );
	    		else if(p1.x === 0 ) uv.set( p1.z, p1.y );
	    		//uvs.push( uv );

	    		//console.log( uv, lng, this.angles[i-1][0], this.angles[i-1][1])

	    		if(i===1) chain.addBone( new Bone2D( new V2(0, 0), null, uv, lng, this.angles[i-1][0], this.angles[i-1][1] ) );
	    		//else chain.addConsecutiveBone( uv, lng );//, this.angles[i-1][0], this.angles[i-1][1] );
	    		else chain.addConsecutiveBone( uv, lng, this.angles[i-1][0], this.angles[i-1][1] );
	    	}

	    }

	    //if(this.target.z === 0 ) chain.embeddedTarget.set( this.target.x, this.target.y );
	    //else if(this.target.x === 0 ) chain.embeddedTarget.set( this.target.z, this.target.y );
	    this.target.set( 10, 20, 0 )

	    this.solver.add( chain, this.target, true );

	    //this.solver.chains[0].embeddedTarget.set(10, 10)


	    //console.log( lengths );
	    //console.log( this.bones, this.target, this.solver.chains[0].bones );

	},

	update: function () {

		this.solver.update();

		var bones2d = this.solver.chains[0].bones;
		var n = this.numBones-1;

		var a;

		for(var i = 0; i < n; i++){

			a = i===0 ? _Math.findAngle( this.fakeBone, bones2d[i] ) : _Math.findAngle( bones2d[i-1], bones2d[i] );
			this.rotation[i] = a * _Math.toDeg;
		    this.rotation[i] += a < 0 ? 180 : -180;
		    this.rotation[i] *= -1;

		}

		for( var i = 0; i < n; i++ ){
			this.bones[i].rotation.z = this.rotation[i] * _Math.toRad;
		}

		console.log(this.rotation)
		//var r = FIK._Math.findAngle(bones[0], bones[1]);

	}

} );

export { HISolver };