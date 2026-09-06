"""Build the original monochrome Bruynzeel kitchen study for Vlak.

blender --background --python apps/www/scripts/build-inspiration-kitchen.py -- --render
Exports only kitchen.glb and kitchen-manifest.json. --render also writes
/tmp/vlak-inspiration-renders/kitchen.png, ready to encode as kitchen-poster.webp.
The reference is the complete cabinet arrangement in zwart-bruynzeel.webp.
It is an interpretive model, not a dimensionally accurate historical replica.
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


def torus(name, center, major, minor, mat, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=32, minor_segments=8, location=center, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj


def sphere(name, center, radius, mat, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=radius, location=center)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj


def build_kitchen():
    enamel = material("Kitchen · satin lacquer cabinetry", .32, .31)
    enamel.node_tree.nodes.get("Principled BSDF").inputs["Coat Weight"].default_value = .13
    enamel.node_tree.nodes.get("Principled BSDF").inputs["Coat Roughness"].default_value = .26
    shell = material("Kitchen · cabinet sides and reveals", .25, .46)
    wood = material("Kitchen · graphite stained worktop", .075, .30)
    woodedge = material("Kitchen · end grain and shelf edges", .12, .49)
    chrome = material("Kitchen · polished nickel fittings", .72, .17, .94)
    ceramic = material("Kitchen · porcelain sink and crockery", .83, .21)
    dark = material("Kitchen · recessed shadow gaps", .045, .84)
    wall = material("Kitchen · plaster wall", .71, .94)
    tile = material("Kitchen · pale stone floor", .61, .80)
    glass = material("Kitchen · smoked glass storage bins", .23, .15, .24)
    cloth = material("Kitchen · folded linen", .68, .98)
    # An open room section supports the whole kitchen while allowing close orbiting.
    cube("Room cutaway floor", (0, -.045, .028), (3.30, 1.06, .056), tile, .006)
    cube("Room cutaway rear wall", (0, .359, .938), (3.30, .044, 1.876), wall, .004)
    cube("Low left return wall", (-1.633, -.01, .29), (.034, .77, .56), wall, .002)
    cube("Rear wall skirting", (0, .330, .087), (3.25, .024, .056), enamel, .0015)
    for x in [-1.375, -.825, -.275, .275, .825, 1.375]:
        cube("Floor stone joint", (x, -.073, .057), (.0015, .997, .001), wall)
    for y in [-.388, -.038, .312]:
        cube("Floor cross joint", (0, y, .057), (3.24, .0015, .001), wall)
    # Cabinet widths preserve the uneven modular rhythm of the photographed work.
    front, rear = -.293, .269
    toe_top, countertop = .112, .765
    def handle(cx, z, vertical=False, y=front-.033):
        length = .095 if vertical else .161
        if vertical:
            cube("Vertical streamlined nickel pull", (cx, y-.016, z), (.015, .020, length), chrome, .0045)
            for offset in [-length*.37, length*.37]:
                cube("Pull stand off", (cx, y+.0005, z+offset), (.011, .026, .014), chrome, .002)
        else:
            cube("Horizontal streamlined nickel pull", (cx, y-.016, z), (length, .020, .015), chrome, .0045)
            cube("Pull dark grip underside", (cx, y-.006, z-.006), (length-.029, .016, .006), dark, .001)
            for offset in [-length*.39, length*.39]:
                cube("Pull stand off", (cx+offset, y+.0005, z), (.013, .027, .010), chrome, .002)
    def hinges(x, bottom, height, y=front-.011):
        for z in [bottom + height*.12, bottom+height*.88]:
            rod("Exposed cabinet hinge barrel", (x, y-.012, z-.018), (x, y-.012, z+.018), .0036, chrome, 12)
            cube("Hinge plate", (x+.003, y, z), (.013, .009, .029), chrome, .001)
    def base_cabinet(left, right, name, drawers=False, bread=False):
        width=right-left
        cx=(left+right)/2
        cube(name+" carcass", (cx, -.005, .417), (width-.005, .544, .610), shell, .002)
        cube(name+" recessed toe kick", (cx, .015, .083), (width-.012, .476, .055), dark, .001)
        cube(name+" worktop", (cx, -.014, countertop), (width+.004, .602, .027), wood, .005)
        cube(name+" laminated edge", (cx, -.315, countertop-.006), (width+.002, .003, .007), woodedge, .0008)
        if drawers:
            bottom=.122
            heights=[.144,.139,.103,.103,.101]
            for i, height in enumerate(heights):
                z=bottom+height/2
                cube("Five drawer bank front", (cx, front-.012, z), (width-.014,.021,height-.007), enamel, .003)
                handle(cx,z+height*.19)
                bottom+=height
        else:
            top=.632 if bread else .735
            bottom=.121
            cube(name+" flush panel door", (cx, front-.012, (top+bottom)/2), (width-.014,.021,top-bottom-.007), enamel,.003)
            handle(cx,top-.046)
            hinges(left+.009,bottom,top-bottom)
            if bread:
                cube("Recessed breadboard slot", (cx, front-.014, .694), (width-.028,.037,.080), dark, .001)
                cube("Pull out wooden breadboard", (cx, -.151, .682), (width-.050,.469,.015), woodedge,.003)
                cube("Breadboard front rounded edge", (cx, -.390, .682), (width-.049,.017,.015), wood,.004)
                cube("Breadboard inset pull", (cx, -.400, .682), (.109,.008,.005), chrome,.0015)
    base_cabinet(-1.17,-.70,"Left preparation cabinet")
    base_cabinet(-.20,.29,"Breadboard cabinet",bread=True)
    base_cabinet(.29,.76,"Central storage cabinet")
    base_cabinet(.76,1.18,"Drawer cabinet",drawers=True)
    base_cabinet(1.18,1.59,"Right storage cabinet")
    # Tall pantry and its separate top compartment anchor the left end.
    cube("Full height pantry carcass", (-1.38,-.006,.856), (.414,.546,1.48), shell,.003)
    cube("Pantry recessed plinth", (-1.38,.013,.084), (.402,.472,.057), dark,.001)
    cube("Pantry tall door", (-1.38,front-.012,.733), (.402,.022,1.22), enamel,.0035)
    cube("Pantry upper door", (-1.38,front-.012,1.482), (.402,.022,.264), enamel,.0035)
    handle(-1.224,1.468,vertical=True)
    handle(-1.222,.204,vertical=True)
    hinges(-1.586,.122,1.22)
    hinges(-1.586,1.35,.264)
    # The adjoining short upper cabinet and the deeper double wall cupboard.
    def upper(left,right,bottom,top,two=False):
        width=right-left; cx=(left+right)/2
        dep=.319; cy=.113; face=-.050
        cube("Upper cupboard carcass",(cx,cy,(top+bottom)/2),(width,dep,top-bottom),shell,.003)
        count=2 if two else 1
        for i in range(count):
            w=width/count; x=left+w*(i+.5)
            cube("Upper cupboard flush door",(x,face-.012,(top+bottom)/2),(w-.007,.022,top-bottom-.007),enamel,.003)
            hx=x+(.5*w-.037 if i==0 else -.5*w+.037)
            handle(hx,(top+bottom)/2,vertical=True,y=face-.033)
            hinges(x-w/2+.010 if i==0 else x+w/2-.010,bottom,top-bottom,y=face-.011)
    upper(-1.17,-.70,1.348,1.614)
    upper(.285,1.18,1.005,1.614,two=True)
    # The porcelain apron sink is genuinely hollow, with rounded inner edges.
    sink_x=-.45
    outer=cube("Porcelain apron sink",(sink_x,-.016,.676),(.493,.524,.191),ceramic)
    cutter=cube("Basin cavity cutter",(sink_x,-.005,.749),(.427,.435,.202),ceramic,.014)
    bpy.context.view_layer.objects.active=outer
    mod=outer.modifiers.new("Recessed working sink basin","BOOLEAN")
    mod.operation="DIFFERENCE"; mod.object=cutter
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter,do_unlink=True)
    mod=outer.modifiers.new("Soft glazed porcelain rims","BEVEL")
    mod.width=.009; mod.segments=5
    bpy.ops.object.modifier_apply(modifier=mod.name)
    for face in outer.data.polygons: face.use_smooth=True
    mod=outer.modifiers.new("Porcelain face normals","WEIGHTED_NORMAL")
    bpy.ops.object.modifier_apply(modifier=mod.name)
    # The open sink stand exposes its paired wooden drying rails and shelf.
    for px in [-.690,-.210]:
        cube("Open sink cabinet side support",(px,-.004,.345),(.015,.516,.464),enamel,.002)
        cube("Sink shelf end support",(px,-.009,.299),(.020,.498,.038),woodedge,.002)
    for y in [-.230,-.137,-.044,.049,.142,.221]:
        cube("Under sink wooden draining shelf slat",(sink_x,y,.311),(.469,.066,.019),woodedge,.0025)
    for i in range(3):
        cube("Folded linen on open shelf",(-.477,.045,.326+i*.009),(.235,.243,.008),cloth,.003)
    cube("Linen folded edge",(-.477,-.078,.339),(.235,.006,.020),cloth,.002)
    torus("Sink drain polished rim",(sink_x,.072,.652),.017,.0025,chrome)
    rod("Sink dark drain insert",(sink_x,.072,.649),(sink_x,.072,.651),.014,dark,24)
    for angle in [0,math.pi/2]:
        d=Vector((math.cos(angle)*.010,math.sin(angle)*.010,0))
        rod("Drain grate",Vector((sink_x,.072,.652))+d,Vector((sink_x,.072,.652))-d,.001,chrome,8)
    # Period-style wall tap, two cross valves, and an arched spout over the basin.
    rod("Tap wall rose",(sink_x,.305,.976),(sink_x,.327,.976),.024,chrome,24)
    tap_points=[(sink_x,.308,.976),(sink_x,.213,.976),(sink_x,.177,1.026),(sink_x,.037,1.026),(sink_x,-.008,.994),(sink_x,-.008,.962)]
    tube("Continuous arched sink spout",rounded_path(tap_points,.038,12),.009,chrome)
    rod("Tap aerator",(sink_x,-.008,.964),(sink_x,-.008,.951),.011,chrome,24)
    for x in [sink_x-.113,sink_x+.113]:
        rod("Cross valve wall rose",(x,.304,.958),(x,.325,.958),.021,chrome,24)
        rod("Cross valve spindle",(x,.270,.958),(x,.313,.958),.009,chrome,16)
        sphere("Porcelain tap index",(x,.263,.958),.011,ceramic,scale=(1,.45,1))
        for angle in [0,math.pi/2]:
            dx,dz=math.cos(angle)*.027,math.sin(angle)*.027
            rod("Cross valve handle",(x-dx,.269,.958-dz),(x+dx,.269,.958+dz),.0042,chrome,12)
            for sign in [-1,1]: sphere("Valve handle rounded end",(x+sign*dx,.269,.958+sign*dz),.0056,chrome)
    # The original long rack bridges the gap above the sink.
    left,right=-.686,.265
    for z in [1.366,1.412,1.464]:
        rod("Utensil rack horizontal rail",(left,.185,z),(right,.185,z),.0045,chrome,16)
    for x in [left+.019,(left+right)/2,right-.019]:
        cube("Utensil rack painted vertical",(x,.231,1.419),(.016,.083,.144),enamel,.002)
        rod("Rack vertical joining pin",(x,.170,1.362),(x,.170,1.481),.003,chrome,12)
    cube("Utensil rack timber cap",((left+right)/2,.179,1.501),(right-left+.029,.204,.020),wood,.004)
    cube("Utensil rack lower timber rail",((left+right)/2,.198,1.350),(right-left,.031,.011),woodedge,.002)
    for i in range(7):
        x=left+.081+i*.126
        hook=[(x,.186,1.358),(x,.172,1.346),(x,.170,1.315),(x,.151,1.306),(x,.142,1.321)]
        tube("Small hanging utensil hook",rounded_path(hook,.008,6),.0018,chrome)
    # A pair of flat spoons is enough to show the hanging rail's function.
    for x in [-.581,-.455]:
        rod("Hanging spoon handle",(x,.145,1.309),(x,.145,1.171),.003,chrome,12)
        sphere("Hanging spoon bowl",(x,.145,1.153),.021,chrome,scale=(.64,.16,1))
    # Eight under-cabinet glass bins are a signature of this modular kitchen.
    storage_left,storage_right=.29,1.177
    cube("Under cupboard storage rack",((storage_left+storage_right)/2,.076,.962),(storage_right-storage_left,.313,.072),dark,.002)
    count=8; step=(storage_right-storage_left)/count
    for i in range(count):
        x=storage_left+step*(i+.5)
        for side in [-1,1]:
            cube("Storage bin clear side",(x+side*(step*.39),.014,.958),(.006,.236,.060),glass,.001)
        cube("Storage bin clear floor",(x,.014,.930),(step*.83,.236,.006),glass,.001)
        cube("Storage bin glazed front",(x,-.106,.962),(step*.83,.010,.068),glass,.003)
        cube("Glass bin shallow pull",(x,-.115,.947),(.022,.012,.007),glass,.002)
        cube("Storage rack upper runner",(x,-.085,.995),(step*.88,.018,.006),chrome,.001)
        cube("Stored pale ingredient",(x,.012,.942),(step*.64,.126,.016),ceramic,.001)
    # A slender drainer on the left worktop and a shallow dish on the right.
    for i in range(7):
        x=-1.098+i*.051
        rod("Countertop drainer rail",(x,-.240,.787),(x,.164,.787),.0021,chrome,8)
    for y in [-.247,.17]:
        rod("Drainer end support",(-1.118,y,.786),(-.780,y,.786),.0031,chrome,12)
    # A lathed bowl has both the exterior and interior wall, with no solid cap.
    profile=[(.025,.778),(.035,.780),(.060,.799),(.086,.834),(.088,.837),(.084,.839),(.080,.834),(.055,.803),(.029,.786),(0,.786)]
    vertices=[]; faces=[]; segments=56
    for radius,z in profile:
        for j in range(segments):
            angle=j*math.tau/segments
            vertices.append((1.358+math.cos(angle)*radius,.034+math.sin(angle)*radius,z))
    for i in range(len(profile)-1):
        for j in range(segments):
            a=i*segments+j; b=i*segments+(j+1)%segments
            faces.append((a,b,b+segments,a+segments))
    mesh=bpy.data.meshes.new("Shallow stoneware bowl geometry"); mesh.from_pydata(vertices,[],faces); mesh.update()
    obj=bpy.data.objects.new("Shallow porcelain preparation bowl",mesh); bpy.context.collection.objects.link(obj); obj.data.materials.append(ceramic)
    for face in mesh.polygons: face.use_smooth=True


def render_kitchen():
    scene=bpy.context.scene
    scene.render.engine="CYCLES"; scene.cycles.samples=96; scene.cycles.use_denoising=True
    try:
        preferences=bpy.context.preferences.addons["cycles"].preferences
        preferences.compute_device_type="METAL"; preferences.get_devices()
        for device in preferences.devices: device.use=device.type=="METAL"
        scene.cycles.device="GPU"
    except Exception: pass
    scene.render.resolution_x=1700; scene.render.resolution_y=1250; scene.render.resolution_percentage=100
    scene.render.image_settings.file_format="PNG"
    scene.view_settings.view_transform="AgX"; scene.view_settings.look="AgX - Medium High Contrast"; scene.view_settings.exposure=-.5
    scene.world.color=(.28,.28,.28)
    floor=material("Studio paper outside export",.82,.7)
    cube("Studio ground outside export",(0,0,-.045),(200,200,.08),floor)
    target=Vector((0,0,.84))
    def light(name,xyz,power,size,height):
        data=bpy.data.lights.new(name,"AREA"); data.energy=power; data.shape="RECTANGLE"; data.size=size; data.size_y=height
        obj=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(obj); obj.location=xyz
        obj.rotation_euler=(target-obj.location).to_track_quat("-Z","Y").to_euler()
    light("Broad window softbox",(-3,-4,5),1200,3.0,4)
    light("Right material highlight",(4,-1,3.8),1100,2.4,3)
    light("Overhead bounce",(0,2.5,6),800,3.0,2)
    bpy.ops.object.camera_add(location=(3.8,-7.2,3.55))
    camera=bpy.context.object; camera.rotation_euler=(target-camera.location).to_track_quat("-Z","Y").to_euler(); camera.data.type="ORTHO"; camera.data.ortho_scale=4.0
    scene.camera=camera; scene.render.filepath=str(POSTERS/"kitchen.png")
    bpy.ops.render.render(write_still=True)


clear()
build_kitchen()
join_materials()
points=[obj.matrix_world@Vector(corner) for obj in bpy.context.scene.objects if obj.type=="MESH" for corner in obj.bound_box]
low=Vector(tuple(min(p[i] for p in points) for i in range(3)))
high=Vector(tuple(max(p[i] for p in points) for i in range(3)))
offset=Vector((-(high.x+low.x)/2,-(high.y+low.y)/2,-low.z))
for obj in bpy.context.scene.objects: obj.location+=offset
size=high-low
bpy.ops.export_scene.gltf(filepath=str(OUTPUT/"kitchen.glb"),export_format="GLB",export_yup=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_texcoords=False,export_normals=True,export_materials="EXPORT")
record={"id":"kitchen","file":"kitchen.glb","dimensions":{"x":round(size.x,4),"y":round(size.z,4),"z":round(size.y,4)},"bytes":(OUTPUT/"kitchen.glb").stat().st_size,"meshes":len([o for o in bpy.context.scene.objects if o.type=="MESH"]),"interpretation":"Original monochrome study after the complete 1938 Piet Zwart Bruynzeel kitchen arrangement. Scale and materials are interpretive, not archival measurements.","referenceImage":"/about/zwart-bruynzeel.webp","sources":["https://www.kunstmuseum.nl/nl/tentoonstellingen/piet-zwart-1885-1977","https://webwinkel.bruynzeelkeukens.nl/geschiedenis","https://kennis.cultureelerfgoed.nl/index.php/Keukens"]}
(OUTPUT/"kitchen-manifest.json").write_text(json.dumps(record,indent=2)+"\n")
print("VLAK_ASSET",json.dumps(record),flush=True)
if RENDER: render_kitchen()
