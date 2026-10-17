# LORT body correction — 20261022c

The previous pelvic bridge used the same 45-unit radius in every direction. Its 90-unit front/back depth exceeded the chest's 64 units, creating a round cushion under the shirt. The replacement is elliptical: 78 units wide and 46 deep. The chest depth is now 50, with a flatter front, a straight lower torso and a collar that flows into the shoulders.

Shoulder joints are 104 units apart instead of 123.5; sleeves sit lower on the shoulder line. Upper arms narrow toward the elbow, forearms toward the wrist. Shorts fit the narrower pelvis, and thigh/knee/calf/ankle volumes taper individually. Standing height, bone lengths, exact foot/contact anchors and both celebration timelines remain intact. No changes to gameplay physics, keepers or other players.

The body still uses 704/360 triangles at near/far detail: no added geometry or runtime dependencies. Six test groups passed: lort-anatomi (6,405 final skeleton poses), lort-body (mesh/UV/shape regression), lort-render (24 shot and 18 celebration renders), derinlik (ball occlusion), cizim (7 viewports), oyun-baslangic (startup/shot/result/next).

Visual comparison: lort-siluet-20261022c.png, top previous 20261022b; bottom corrected 20261022c. Procedural, stylized geometry remains; this is not a sculpted photorealistic character.
