/**
 * @description https://wiki.libsdl.org/SDL3/SDL_SensorType
 */
export enum SDL_SensorType {
  /**< Returned for an invalid sensor */
  SDL_SENSOR_INVALID = -1,
  /**< Unknown sensor type */
  SDL_SENSOR_UNKNOWN,
  /**< Accelerometer */
  SDL_SENSOR_ACCEL,
  /**< Gyroscope */
  SDL_SENSOR_GYRO,
  /**< Accelerometer for left Joy-Con controller and Wii nunchuk */
  SDL_SENSOR_ACCEL_L,
  /**< Gyroscope for left Joy-Con controller */
  SDL_SENSOR_GYRO_L,
  /**< Accelerometer for right Joy-Con controller */
  SDL_SENSOR_ACCEL_R,
  /**< Gyroscope for right Joy-Con controller */
  SDL_SENSOR_GYRO_R,
}
