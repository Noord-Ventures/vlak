"""Build original Vlak inspiration studies with Blender 4.5 or newer.

blender --background --python apps/www/scripts/build-inspiration-assets.py
Add -- --render to create studio poster PNGs in /tmp/vlak-inspiration-renders.
The models are interpretive studies, not archival replicas. Blender Z-up models
are exported to glTF Y-up with their ground at 0 and their X/Z center at 0.
No camera, lights, or studio floor are included in the GLB files.
"""
import bpy
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

OUTPUT = Path(__file__).resolve().parent.parent / "public" / "inspiration"
POSTERS = Path("/tmp/vlak-inspiration-renders")
RENDER = "--render" in sys.argv
OUTPUT.mkdir(parents=True, exist_ok=True)
POSTERS.mkdir(parents=True, exist_ok=True)


def clear():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for data in bpy.data.materials:
        bpy.data.materials.remove(data)


def material(name, gray, roughness=0.5, metal=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (gray, gray, gray, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (gray, gray, gray, 1)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metal
    return mat


def cube(name, location, dimensions, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new("Manufactured edge radius", "BEVEL")
        mod.width = bevel
        mod.segments = 6 if bevel >= 0.012 else 2
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        mod = obj.modifiers.new("Face normals", "WEIGHTED_NORMAL")
        mod.keep_sharp = True
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj


def tube(name, points, radius, mat, cyclic=False, resolution=10):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 1
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    curve.resolution_u = resolution
    curve.use_fill_caps = True
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for vertex, point in zip(spline.points, points):
        vertex.co = (*point, 1)
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj.select_set(False)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def rounded_path(points, radius=0.07, samples=10):
    points = [Vector(point) for point in points]
    result = [points[0]]
    for previous, current, following in zip(points, points[1:], points[2:]):
        distance = min(radius, (current - previous).length * 0.4, (following - current).length * 0.4)
        a = current + (previous - current).normalized() * distance
        b = current + (following - current).normalized() * distance
        result.append(a)
        for i in range(1, samples + 1):
            t = i / samples
            result.append((1 - t) ** 2 * a + 2 * t * (1 - t) * current + t ** 2 * b)
    result.append(points[-1])
    return result


def rod(name, a, b, radius, mat, vertices=12):
    direction = Vector(b) - Vector(a)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=direction.length, location=(Vector(a) + Vector(b)) / 2)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = len(polygon.vertices) == 4
    return obj


def join_materials():
    # One mesh per surface reduces browser draw calls without sacrificing detail.
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    groups = {}
    for obj in meshes:
        groups.setdefault(obj.data.materials[0].name, []).append(obj)
    for name, objects in groups.items():
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        bpy.ops.object.join()
        objects[0].name = name
    bpy.ops.object.select_all(action="DESELECT")


def chair():
    chrome = material("Chair · polished tubular chrome", 0.82, 0.16, 1)
    leather = material("Chair · charcoal upholstery", 0.009, 0.48)
    leather.node_tree.nodes.get("Principled BSDF").inputs["Coat Weight"].default_value = 0.065
    leather.node_tree.nodes.get("Principled BSDF").inputs["Coat Roughness"].default_value = 0.32
    edge = material("Chair · stitched leather piping", 0.029, 0.54)
    rubber = material("Chair · floor glides", 0.025, 0.72)
    # An unbroken swept curve on either side carries the seat and armrest.
    for side in [-1, 1]:
        x = side * 0.29
        points = [(x, .265, .026), (x, -.22, .026), (x, -.315, .10),
                  (x, -.315, .574), (x, -.265, .656), (x, -.18, .681),
                  (x, .23, .681), (x, .292, .625), (x, .292, .458), (x, -.225, .458)]
        tube("Continuous cantilever frame", rounded_path(points, .075, 12), .0145, chrome)
        # Separate, slender back uprights leave air beneath the back cushion.
        tube("Reclining back upright", rounded_path([(side * .244, .246, .465), (side * .244, .271, .693), (side * .244, .318, .849)], .03), .0105, chrome)
        cube("Upholstered armrest", (x, -.015, .701), (.064, .399, .043), leather, .020)
        cube("Armrest inset seam", (x, -.017, .721), (.047, .358, .002), edge, .0008)
        for y in [-.18, .18]:
            cube("Discrete floor glide", (x, y, .013), (.043, .071, .025), rubber, .010)
    # A generous curved return connects both runners at the rear.
    tube("Rear floor return", rounded_path([(-.29, .265, .026), (-.22, .321, .026), (.22, .321, .026), (.29, .265, .026)], .12, 16), .0145, chrome)
    rod("Front seat crossmember", (-.29, -.225, .458), (.29, -.225, .458), .011, chrome)
    rod("Rear seat crossmember", (-.29, .245, .458), (.29, .245, .458), .011, chrome)
    tube("Curved backrest crossmember", [(x, .331 - .055 * (x / .257) ** 2, .735) for x in [(-.244 + i * .488 / 24) for i in range(25)]], .009, chrome)
    cube("Soft seat cushion", (0, -.018, .498), (.53, .488, .057), leather, .026)
    # Subtle continuous top seam traces the edge instead of a texture map.
    seam = [(-.233, -.229, .522), (.233, -.229, .522), (.25, -.21, .522), (.25, .184, .522), (.23, .211, .522), (-.23, .211, .522), (-.25, .19, .522), (-.25, -.21, .522), (-.233, -.229, .522)]
    tube("Seat perimeter stitching", rounded_path(seam, .022, 6), .0011, edge)
    # Bent upholstered back: a subtle horizontal wrap and a reclined face.
    vertices = []
    faces = []
    count_x, count_z = 28, 8
    for j in range(count_z + 1):
        v = j / count_z
        z = .656 + v * .237
        for i in range(count_x + 1):
            x = (i / count_x - .5) * .514
            y = .286 + (z - .656) * .20 - .055 * (x / .257) ** 2
            vertices.append((x, y, z))
    for j in range(count_z):
        for i in range(count_x):
            a = j * (count_x + 1) + i
            faces.append((a, a + 1, a + count_x + 2, a + count_x + 1))
    mesh = bpy.data.meshes.new("Curved cushion geometry")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("Wrapped back cushion", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(leather)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    mod = obj.modifiers.new("Upholstery depth", "SOLIDIFY")
    mod.thickness = .034
    bpy.ops.object.modifier_apply(modifier=mod.name)
    mod = obj.modifiers.new("Cushion edge", "BEVEL")
    mod.width = .012
    mod.segments = 4
    bpy.ops.object.modifier_apply(modifier=mod.name)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    obj.select_set(False)
    for x in [-.225, .225]:
        for z in [.682, .862]:
            y = .286 + (z - .656) * .20 - .055 * (x / .257) ** 2
            rod("Flush polished back fastener", (x, y - .002, z), (x, y - .008, z), .0055, chrome, 16)
    # Scale this furniture study to the same gallery stage as the architecture.
    for obj in bpy.context.scene.objects:
        obj.location *= 3
        obj.scale *= 3


def pavilion():
    plaster = material("Pavilion · chalk plaster", .77, .75)
    concrete = material("Pavilion · cast concrete", .55, .82)
    frame = material("Pavilion · painted window frames", .87, .35, .15)
    glass = material("Pavilion · smoked reflective glazing", .065, .19, .52)
    dark = material("Pavilion · recessed shadow gaps", .115, .85)
    gravel = material("Pavilion · model landscape", .64, .94)
    timber = material("Pavilion · pale sculptural trees", .48, .8)
    # Layered topography is part of the physical model, not a presentation floor.
    cube("Site model plinth", (0, 0, .035), (3.0, 2.28, .07), plaster, .009)
    cube("Upper contour", (-.15, .31, .102), (2.7, 1.36, .134), gravel, .007)
    cube("Lower terrace", (.48, -.61, .108), (1.70, .79, .146), concrete, .005)
    cube("Entry landing", (.67, -.31, .23), (1.19, .56, .097), plaster, .003)
    # Retaining wall, garden edge and an unbroken concrete ribbon.
    cube("Retaining wall", (-.85, -.21, .184), (1.10, .062, .236), concrete, .003)
    cube("Garden edge", (-.73, -.81, .092), (1.30, .042, .074), concrete, .003)
    cube("Forecourt paving", (-.37, -.60, .075), (1.84, .41, .012), plaster, .001)
    for i in range(7):
        height = .015 + i * .019
        cube("Broad approach stair", (.90, -.97 + i * .061, .072 + height / 2), (.51, .064, height), plaster, .0015)
    # The main studio wing. Thin projecting floor and roof plates create rhythm.
    x, y, width, depth = -.07, .0, 2.19, .62
    bottom, height = .278, .665
    cube("Studio shadow volume", (x, y, bottom + height / 2), (width - .09, depth - .042, height), glass, .002)
    for z, thickness in [(bottom, .056), (bottom + .33, .042), (bottom + height, .046)]:
        cube("Studio projecting slab", (x, y, z), (width + .095, depth + .105, thickness), plaster, .003)
    for side in [-1, 1]:
        cube("Studio end wall", (x + side * width / 2, y, bottom + height / 2), (.06, depth, height), plaster, .002)
    for wall_y in [y - depth / 2 - .003, y + depth / 2 + .003]:
        for i in range(15):
            px = x - width / 2 + .072 + i * (width - .144) / 14
            cube("Continuous studio mullion", (px, wall_y, bottom + height / 2), (.013, .019, height - .012), frame, .0008)
        for z in [bottom + .115, bottom + .324, bottom + .462, bottom + .646]:
            cube("Studio window transom", (x, wall_y, z), (width - .12, .023, .012), frame, .0007)
    # Offset taller accommodation volume establishes an asymmetric silhouette.
    tx, ty, tw, td, th, base = -.72, .54, .71, .62, 1.055, .17
    cube("Tall residence body", (tx, ty, base + th / 2), (tw, td, th), plaster, .0035)
    cube("Residence roof plane", (tx, ty, base + th), (tw + .07, td + .07, .041), plaster, .003)
    for wall_y in [ty - td / 2 - .003, ty + td / 2 + .003]:
        for row in range(4):
            z = base + .126 + row * .251
            cube("Residence ribbon glazing", (tx, wall_y, z), (tw - .09, .010, .182), glass, .001)
            for i in range(5):
                cube("Residence window jamb", (tx - tw / 2 + .065 + i * (tw - .13) / 4, wall_y - .007, z), (.010, .020, .191), frame, .0007)
            for dz in [-.096, .096]:
                cube("Residence window sill", (tx, wall_y - .010, z + dz), (tw - .073, .029, .012), frame, .0007)
    # Low workshop wing steps down the site and forms a protected courtyard.
    wx, wy, ww, wd, wb, wh = .70, .58, .81, .63, .17, .37
    cube("Workshop glazing", (wx, wy, wb + wh / 2), (ww - .07, wd - .06, wh), glass, .002)
    for z in [wb, wb + wh]:
        cube("Workshop horizontal plane", (wx, wy, z), (ww + .16, wd + .15, .047), plaster, .003)
    cube("Workshop concrete end", (wx + ww / 2, wy, wb + wh / 2), (.055, wd, wh), plaster, .002)
    for face_y in [wy - wd / 2, wy + wd / 2]:
        for i in range(6):
            cube("Workshop mullion", (wx - ww / 2 + .037 + i * (ww - .074) / 5, face_y, wb + wh / 2), (.014, .025, wh), frame, .001)
        cube("Workshop transom", (wx, face_y, wb + wh * .62), (ww - .055, .025, .010), frame, .0007)
    # A lifted connector and its slender piers give a view through the model.
    cube("Covered connection roof", (.02, .62, .642), (.80, .27, .036), plaster, .002)
    for px in [-.26, .24]:
        cube("Connector pier", (px, .66, .405), (.025, .025, .45), concrete, .001)
    cube("Terrace parapet", (.52, -.348, .303), (.70, .035, .108), plaster, .002)
    cube("Terrace door", (.42, -.318, .436), (.155, .018, .28), dark, .001)
    cube("Entry canopy", (.43, -.405, .595), (.51, .31, .025), plaster, .002)
    # Roof details are designed to reward orbiting above and behind the model.
    for px in [-.40, .02, .44]:
        cube("Inset studio skylight kerb", (px, .01, .978), (.27, .24, .041), concrete, .002)
        cube("Studio skylight glass", (px, -.008, 1.0), (.226, .197, .010), glass, .001)
        cube("Skylight divider", (px, -.008, 1.007), (.008, .199, .008), frame, .0005)
    cube("Workshop roof vent", (.66, .56, .573), (.12, .19, .035), concrete, .002)
    # Fine paving joints make the terrace read at a close orbit.
    for px in [-1.20, -.94, -.68, -.42, -.16, .10]:
        cube("Paving joint", (px, -.60, .082), (.0017, .398, .002), concrete)
    for px, py, scale in [(-1.20, -.72, .82), (1.24, .81, 1.0), (-1.22, .86, .71)]:
        z0 = .08 if py < 0 else .17
        trunk_top = z0 + .41 * scale
        rod("Model tree trunk", (px, py, z0), (px + .012, py, trunk_top), .012 * scale, timber, 10)
        for i in range(6):
            angle = i * math.tau / 6 + .4
            forkz = z0 + (.21 + (i % 3) * .07) * scale
            end = (px + math.cos(angle) * .12 * scale, py + math.sin(angle) * .10 * scale, z0 + (.44 + (i % 2) * .055) * scale)
            rod("Model tree branch", (px, py, forkz), end, .0045 * scale, timber, 8)
            for side in [-1, 1]:
                twig = (end[0] + math.cos(angle + side * .6) * .055 * scale, end[1] + math.sin(angle + side * .6) * .055 * scale, end[2] + .045 * scale)
                rod("Model tree fine branch", Vector(end).lerp(Vector((px, py, forkz)), .32), twig, .002 * scale, timber, 6)


def render_poster(name, bounds):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 80
    scene.cycles.use_denoising = True
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for device in prefs.devices:
            device.use = device.type == "METAL"
        scene.cycles.device = "GPU"
    except Exception:
        pass
    scene.render.resolution_x = 1500
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -.65
    scene.world.color = (.28, .28, .28)
    floor = material("Studio paper", .82, .69)
    cube("Studio ground", (0, 0, -.045), (200, 200, .08), floor)
    def light(label, xyz, watts, size, target, shape="DISK", size_y=None):
        data = bpy.data.lights.new(label, "AREA")
        data.energy = watts
        data.shape = shape
        data.size = size
        if size_y:
            data.size_y = size_y
        obj = bpy.data.objects.new(label, data)
        bpy.context.collection.objects.link(obj)
        obj.location = xyz
        obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()
    center = (0, 0, 1.35 if name == "chair" else .50)
    light("Tall left softbox", (-3, -4, 5.7), 1100, 3.5, center, "RECTANGLE", 5)
    light("Right silver edge", (4, 1, 4), 1700, 2.0, center, "RECTANGLE", 4)
    light("Top reflection", (-1, 3, 6), 1400, 3.2, center, "RECTANGLE", 2)
    light("Front soft reflection", (1, -5, 2.8), 130, 2.2, center)
    bpy.ops.object.camera_add(location=(3.8, -6.3, 3.55) if name == "chair" else (4.3, -6.1, 4.0))
    camera = bpy.context.object
    camera.rotation_euler = (Vector(center) - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 4.4 if name == "chair" else 4.05
    scene.camera = camera
    scene.render.filepath = str(POSTERS / f"{name}.png")
    bpy.ops.render.render(write_still=True)


manifest = []
for name, builder in [("chair", chair), ("pavilion", pavilion)]:
    clear()
    builder()
    join_materials()
    points = [obj.matrix_world @ Vector(corner) for obj in bpy.context.scene.objects if obj.type == "MESH" for corner in obj.bound_box]
    low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    offset = Vector((-(high.x + low.x) / 2, -(high.y + low.y) / 2, -low.z))
    for obj in bpy.context.scene.objects:
        obj.location += offset
    size = high - low
    bpy.ops.export_scene.gltf(filepath=str(OUTPUT / f"{name}.glb"), export_format="GLB", export_yup=True, export_apply=True, export_cameras=False, export_lights=False, export_animations=False, export_texcoords=False, export_normals=True, export_materials="EXPORT")
    record = {"id": name, "file": f"{name}.glb", "dimensions": {"x": round(size.x, 4), "y": round(size.z, 4), "z": round(size.y, 4)}, "bytes": (OUTPUT / f"{name}.glb").stat().st_size, "meshes": len([obj for obj in bpy.context.scene.objects if obj.type == "MESH"])}
    manifest.append(record)
    print("VLAK_ASSET", json.dumps(record), flush=True)
    if RENDER:
        render_poster(name, size)
(OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
