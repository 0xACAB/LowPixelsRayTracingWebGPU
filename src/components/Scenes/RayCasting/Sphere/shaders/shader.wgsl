@vertex
fn vs(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    let pos = array(
        vec2f( 0.0,  0.5),  // top center
        vec2f(-0.5, -0.5),  // bottom left
        vec2f( 0.5, -0.5)   // bottom right
    );

    return vec4f(pos[vertexIndex], 0.0, 1.0);
}

// A structure with three members.
struct Pixel {
  coordinate: vec2<f32>,
  color: vec3<f32>
}

fn rayTrace() -> vec3<f32> {
    return vec3f(1, 0, 0);
}
// Declare a variable storing a value of type Data.
var<private> some_data: Pixel;
@fragment
fn fs() -> @location(0) vec4f {
    return vec4f(rayTrace(), 1);
}