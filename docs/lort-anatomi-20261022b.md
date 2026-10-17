# LORT anatomy and animation — 20261022b

LORT now uses a skeleton solved in final drawing coordinates. The previous nonlinear visual scaling stretched bones and left short legs under a long torso. The new pose uses 110/108-unit legs and 76/72-unit arms, a smaller 29/35/27 head, and a short collar-to-jaw gap. Overall standing head height remains 471 units. Shot/support foot anchors are copied exactly from the existing gameplay rig.

The pelvis lowers when needed to reach a planted foot; limbs never stretch. A LORT-only 120 ms blend removes an existing torso lean discontinuity at impact. The fitted kit, joint shells and slightly rounder limbs follow the same joints. Smaller head/boot meshes offset the extra body geometry. No new runtime assets, downloads or dependencies.

Both goal close-up variants now use this same 3D body: an open-arm acknowledgement and a raised fist. Positive elbow flexion and fixed bones replace the old sprite-frame swaps. Reduced motion freezes the pose. Other players, ball simulation, scoring and keeper rules are unchanged.

Validation: 12 test groups passed: lort-anatomi, lort-body, lort-render, futbolcu3d, kosu, derinlik, cizim, oyun-baslangic, tribun-sevinc, sevinc-2b, meto-anatomi, akis. Includes 6,405 final-skeleton poses, fixed bone lengths, exact foot anchors, phase continuity, 24 shot renders at two sizes/four angles, and 18 celebration renders. Before/after contact sheet: lort-anatomi-20261022b.png (top previous; bottom updated).

Limit: this remains a lightweight procedural Canvas character with photographic head textures, not a scanned or sculpted high-resolution character. Automated checks establish mechanics and rendering, not a subjective realism score or device-specific frame rate.
