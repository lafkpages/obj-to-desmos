import OBJFile from "obj-file-parser";

const axes = ["x", "y", "z"] as const;
const otherAxes = {
  x: ["y", "z"],
  y: ["x", "z"],
  z: ["x", "y"],
} satisfies Record<(typeof axes)[number], [(typeof axes)[number], (typeof axes)[number]]>;

export function generateEquations(model: OBJFile.ObjModel) {
  const vertices = axes.map(
    (axis) =>
      `${axis}_{0}=\\left[` + model.vertices.map((vertex) => vertex[axis]).join(",") + "\\right]",
  );

  const rotatedVertices = axes
    .map((rotationAxis, rotationAxisIndex) =>
      axes.map((axis, axisIndex) =>
        axis == rotationAxis
          ? `${axis}_{${axisIndex + 1}}=${axis}_{${axisIndex}}`
          : `${axis}_{${rotationAxisIndex + 1}}=\\left[` +
            model.vertices
              .map(
                (_, i) =>
                  `R_{${rotationAxis}${axis}}\\left(${otherAxes[rotationAxis][0]}_{${rotationAxisIndex}}\\left[${i + 1}\\right],${otherAxes[rotationAxis][1]}_{${rotationAxisIndex}}\\left[${i + 1}\\right],${rotationAxis.toUpperCase()}_{rot}\\right)`,
              )
              .join(",") +
            "\\right]",
      ),
    )
    .flat();

  const faces = model.faces.map(
    (face) =>
      "\\operatorname{polygon}\\left(" +
      face.vertices
        .map((vertex) => {
          let index: number;
          if (vertex.vertexIndex < 0) {
            index = model.vertices.length + vertex.vertexIndex;
          } else {
            index = vertex.vertexIndex;
          }

          return `p\\left[${index}\\right]`;
        })
        .join(",") +
      "\\right)",
  );

  return {
    vertices,
    rotatedVertices,
    faces,
  };
}
