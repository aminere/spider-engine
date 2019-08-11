import { NONE, GLOBAL_ROTOR, GLOBAL_HINGE, LOCAL_ROTOR, LOCAL_HINGE, J_BALL, J_GLOBAL, J_LOCAL, END, START } from '../constants.js';
import { _Math } from '../math/Math.js';

function Structure3D () {

    this.fixedBaseMode = true;

    this.chains = [];
    this.targets = [];
    this.numChains = 0;

    this.tmpMtx = new FIK.M3();
}

Object.assign( Structure3D.prototype, {

    update:function(){

        var chain, mesh, bone, target;
        var hostChainNumber;
        var hostBone, constraintType;

        //var i =  this.numChains;

        //while(i--){

        for( var i = 0; i < this.numChains; i++ ){

            chain = this.chains[i];
            target = this.targets[i];

            hostChainNumber = chain.getConnectedChainNumber();

            if ( hostChainNumber !== -1 ){

                hostBone  = this.chains[ hostChainNumber ].bones[ chain.getConnectedBoneNumber() ];

                chain.setBaseLocation( chain.getBoneConnectionPoint() === START ? hostBone.start : hostBone.end );

                // Now that we've clamped the base location of this chain to the start or end point of the bone in the chain we are connected to, it's
                // time to deal with any base bone constraints...

                constraintType = chain.getBaseboneConstraintType();

                switch (constraintType){

                    case NONE:         // Nothing to do because there's no basebone constraint
                    case GLOBAL_ROTOR: // Nothing to do because the basebone constraint is not relative to bones in other chains in this structure
                    case GLOBAL_HINGE: // Nothing to do because the basebone constraint is not relative to bones in other chains in this structure
                        break;
                        
                    // If we have a local rotor or hinge constraint then we must calculate the relative basebone constraint before calling solveForTarget
                    case LOCAL_ROTOR:
                    case LOCAL_HINGE:

                    //chain.resetTarget(); // ??

                    // Get the direction of the bone this chain is connected to and create a rotation matrix from it.
                    this.tmpMtx.createRotationMatrix( hostBone.getDirectionUV() );
                    //var connectionBoneMatrix = new FIK.M3().createRotationMatrix( hostBone.getDirectionUV() );
                        
                    // We'll then get the basebone constraint UV and multiply it by the rotation matrix of the connected bone 
                    // to make the basebone constraint UV relative to the direction of bone it's connected to.
                    //var relativeBaseboneConstraintUV = connectionBoneMatrix.times( c.getBaseboneConstraintUV() ).normalize();
                    var relativeBaseboneConstraintUV = chain.getBaseboneConstraintUV().clone().applyM3( this.tmpMtx );
                            
                    // Update our basebone relative constraint UV property
                    chain.setBaseboneRelativeConstraintUV( relativeBaseboneConstraintUV );
                        
                    // Update the relative reference constraint UV if we hav a local hinge
                    if (constraintType === LOCAL_HINGE )
                        chain.setBaseboneRelativeReferenceConstraintUV( chain.bones[0].joint.getHingeReferenceAxis().clone().applyM3( this.tmpMtx ) );
                        
                    break;

                }

                
                

            }

            // Finally, update the target and solve the chain
            if ( !chain.useEmbeddedTarget ) chain.solveForTarget( target );
            else chain.solveForEmbeddedTarget();
        }

    },

    clear:function(){

        var i, j;

        i = this.numChains;
        while(i--){
            this.remove(i);
        }

        this.chains = [];
        this.targets = [];

    },

    add:function( chain, target){

        this.chains.push( chain );
         
        this.targets.push( target ); 
        this.numChains ++;
    },

    

    remove:function( id ){

        this.chains[id].clear();
        this.chains.splice(id, 1);
        this.targets.splice(id, 1);
        this.numChains --;

    },

    setFixedBaseMode:function( value ){

        this.fixedBaseMode = value; 
        var i = this.numChains, host;
        while(i--){
            host = this.chains[i].getConnectedChainNumber();
            if( host===-1 ) this.chains[i].setFixedBaseMode( this.fixedBaseMode );
        }

    },

    getNumChains:function(){

        return this.numChains;

    },

    getChain:function(id){

        return this.chains[id];

    },

    connectChain : function( Chain, chainNumber, boneNumber, point, target, meshBone, color ){

        var c = chainNumber;
        var n = boneNumber;

        if ( chainNumber > this.numChains ) return;
        if ( boneNumber > this.chains[chainNumber].numBones ) return;

        // Make a copy of the provided chain so any changes made to the original do not affect this chain
        var chain = Chain.clone();//new Fullik.Chain( newChain );
        if( color !== undefined ) chain.setColor( color );

        // Connect the copy of the provided chain to the specified chain and bone in this structure
        //chain.connectToStructure( this, chainNumber, boneNumber );

        chain.setBoneConnectionPoint( point === 'end' ? END : START );
        chain.setConnectedChainNumber( c );
        chain.setConnectedBoneNumber( n );

        // The chain as we were provided should be centred on the origin, so we must now make it
        // relative to the start location of the given bone in the given chain.

        var position = point === 'end' ? this.chains[ c ].bones[ n ].end : this.chains[ c ].bones[ n ].start;
         

        chain.setBaseLocation( position );
        // When we have a chain connected to a another 'host' chain, the chain is which is connecting in
        // MUST have a fixed base, even though that means the base location is 'fixed' to the connection
        // point on the host chain, rather than a static location.
        chain.setFixedBaseMode( true );

        // Translate the chain we're connecting to the connection point
        for ( var i = 0; i < chain.numBones; i++ ){

            chain.bones[i].start.add( position );
            chain.bones[i].end.add( position );

        }
        
        this.add( chain, target, meshBone );

    }

} );

export { Structure3D };