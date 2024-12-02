@binding(0) @group(0) var<uniform> iTime : f32;
struct OurVertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) texcoord: vec2f
};
@vertex fn vs(
    @builtin(vertex_index) vertexIndex : u32
) -> OurVertexShaderOutput {
    const pos = array(
        // 1st triangle
        vec2f( -1.0,  -1.0),  // center
        vec2f( 1.0,  -1.0),  // right, center
        vec2f( -1.0,  1.0),  // center, top

        // 2nd triangle
        vec2f( -1.0,  1.0),  // center, top
        vec2f( 1.0,  -1.0),  // right, center
        vec2f( 1.0,  1.0),  // right, top
    );
    var vsOutput: OurVertexShaderOutput;

    let xy = pos[vertexIndex];
    vsOutput.position = vec4f(xy, 0.0, 1.0);

    vsOutput.texcoord = xy;
    return vsOutput;
}

struct Pixel {
    coordinate: vec2<f32>,
    color: vec3<f32>
}
fn rayTrace(fsInput: OurVertexShaderOutput) -> vec4<f32> {
    let pixel = Pixel(fsInput.texcoord, vec3f(0,0,0));
    return vec4f(0,cos(fsInput.texcoord.x),sin(iTime),1);
}

@fragment fn fs(fsInput: OurVertexShaderOutput) -> @location(0) vec4<f32> {
    return rayTrace(fsInput);
}