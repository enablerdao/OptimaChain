/**
 * ShaderPass Fix
 * This module provides a fix for the THREE.ShaderPass issue
 */

// Check if THREE is available
if (typeof THREE !== 'undefined') {
  // Create ShaderPass if it doesn't exist
  if (typeof THREE.ShaderPass === 'undefined') {
    console.log('Creating ShaderPass class');
    
    // Define ShaderPass class
    THREE.ShaderPass = function(shader, textureID) {
      THREE.Pass.call(this);
      
      this.textureID = (textureID !== undefined) ? textureID : "tDiffuse";
      
      if (shader instanceof THREE.ShaderMaterial) {
        this.uniforms = shader.uniforms;
        this.material = shader;
      } else if (shader) {
        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        this.material = new THREE.ShaderMaterial({
          defines: Object.assign({}, shader.defines || {}),
          uniforms: this.uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader
        });
      }
      
      this.fsQuad = new THREE.FullScreenQuad(this.material);
    };
    
    THREE.ShaderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
      constructor: THREE.ShaderPass,
      
      render: function(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        if (this.uniforms[this.textureID]) {
          this.uniforms[this.textureID].value = readBuffer.texture;
        }
        
        this.fsQuad.material = this.material;
        
        if (this.renderToScreen) {
          renderer.setRenderTarget(null);
          this.fsQuad.render(renderer);
        } else {
          renderer.setRenderTarget(writeBuffer);
          if (this.clear) renderer.clear();
          this.fsQuad.render(renderer);
        }
      }
    });
  }
  
  // Create FullScreenQuad if it doesn't exist
  if (typeof THREE.FullScreenQuad === 'undefined') {
    console.log('Creating FullScreenQuad class');
    
    THREE.FullScreenQuad = (function () {
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geometry = new THREE.PlaneBufferGeometry(2, 2);
      
      const FullScreenQuad = function (material) {
        this._mesh = new THREE.Mesh(geometry, material);
      };
      
      Object.defineProperty(FullScreenQuad.prototype, 'material', {
        get: function () {
          return this._mesh.material;
        },
        set: function (value) {
          this._mesh.material = value;
        }
      });
      
      Object.assign(FullScreenQuad.prototype, {
        dispose: function () {
          this._mesh.geometry.dispose();
        },
        render: function (renderer) {
          renderer.render(this._mesh, camera);
        }
      });
      
      return FullScreenQuad;
    })();
  }
  
  // Create Pass if it doesn't exist
  if (typeof THREE.Pass === 'undefined') {
    console.log('Creating Pass class');
    
    THREE.Pass = function () {
      this.enabled = true;
      this.needsSwap = true;
      this.clear = false;
      this.renderToScreen = false;
    };
    
    Object.assign(THREE.Pass.prototype, {
      setSize: function(width, height) {},
      render: function(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
        console.error('THREE.Pass: .render() must be implemented in derived pass.');
      }
    });
  }
  
  // Create UniformsUtils if it doesn't exist
  if (typeof THREE.UniformsUtils === 'undefined') {
    console.log('Creating UniformsUtils');
    
    THREE.UniformsUtils = {
      clone: function (uniforms_src) {
        const uniforms_dst = {};
        
        for (const u in uniforms_src) {
          uniforms_dst[u] = {};
          
          for (const p in uniforms_src[u]) {
            const parameter_src = uniforms_src[u][p];
            
            if (parameter_src && 
                (parameter_src.isColor || 
                 parameter_src.isMatrix3 || 
                 parameter_src.isMatrix4 || 
                 parameter_src.isVector2 || 
                 parameter_src.isVector3 || 
                 parameter_src.isVector4 || 
                 parameter_src.isTexture)) {
              uniforms_dst[u][p] = parameter_src.clone();
            } else if (Array.isArray(parameter_src)) {
              uniforms_dst[u][p] = parameter_src.slice();
            } else {
              uniforms_dst[u][p] = parameter_src;
            }
          }
        }
        
        return uniforms_dst;
      }
    };
  }
}
