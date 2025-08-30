/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PenAxis
 */
export enum SDL_PenAxis {
  SDL_PEN_AXIS_PRESSURE /**< Pen pressure.  Unidirectional: 0 to 1.0 */,
  SDL_PEN_AXIS_XTILT /**< Pen horizontal tilt angle.  Bidirectional: -90.0 to 90.0 (left-to-right). */,
  SDL_PEN_AXIS_YTILT /**< Pen vertical tilt angle.  Bidirectional: -90.0 to 90.0 (top-to-down). */,
  SDL_PEN_AXIS_DISTANCE /**< Pen distance to drawing surface.  Unidirectional: 0.0 to 1.0 */,
  SDL_PEN_AXIS_ROTATION /**< Pen barrel rotation.  Bidirectional: -180 to 179.9 (clockwise, 0 is facing up, -180.0 is facing down). */,
  SDL_PEN_AXIS_SLIDER /**< Pen finger wheel or slider (e.g., Airbrush Pen).  Unidirectional: 0 to 1.0 */,
  SDL_PEN_AXIS_TANGENTIAL_PRESSURE /**< Pressure from squeezing the pen ("barrel pressure"). */,
  SDL_PEN_AXIS_COUNT /**< Total known pen axis types in this version of SDL. This number may grow in future releases! */,
}
