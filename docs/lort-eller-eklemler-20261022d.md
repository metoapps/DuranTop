# LORT hands and joints — 20261022d

The wrist nodes previously had a small ellipsoid centred on them. Much of the shape was inside the forearm and its exposed tip looked like an arm stump. The new geometry extends beyond the wrist: a palm, four two-segment fingers, opposed thumb and thenar/web volume. Finger curl follows the raised-fist celebration. Distant players use a cheaper palm/knuckle/thumb silhouette. Hands follow the forearm orientation and root translation. Their diffuse lighting prevents small facets from reading as dark gloves.

Elbow/knee double cones were fixed to world vertical and made pointed seams. Rounded ring shells now follow the direction between neighbouring limb joints. Standing height, foot anchors, arm/leg bone lengths, slim torso/pelvis, other players and gameplay remain intact.

Near body mesh: 752 triangles; hands: 224 (the replaced hand ellipsoids used 240). Far body: 392; hands: 72 (same as old far hands). This is 32 extra solid triangles near, 32 far across the complete body/hand replacement. No extra textured triangles or runtime assets.

Validation: eight test groups: lort-eller, lort-anatomi, lort-body, lort-render, derinlik, cizim, oyun-baslangic, tribun-sevinc. Includes 1,338 hand pose/LOD cases, 6,405 final anatomy poses, 42 real Canvas shot/celebration renders, and start/shot/result/next flow. Tests check visible extension past wrists, fingers/thumbs, curl, attachment, exact foot anchors and bounded geometry.

Before/after: lort-eller-eklemler-20261022d.jpg (detail), lort-eller-tam-beden-20261022d.jpg (full body). Top old, bottom updated. This remains a stylized procedural model: facial volume, cloth deformation and shoulder/pelvis counter-rotation remain visibly limited; passing tests is not evidence of photorealism.
