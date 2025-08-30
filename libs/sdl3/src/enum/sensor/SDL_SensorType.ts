/**
 * @description https://wiki.libsdl.org/SDL3/SDL_SensorType
 */
export enum SDL_SensorType {
  SDL_SENSOR_INVALID = -1 /**< Returned for an invalid sensor */,
  SDL_SENSOR_UNKNOWN /**< Unknown sensor type */,
  SDL_SENSOR_ACCEL /**< Accelerometer */,
  SDL_SENSOR_GYRO /**< Gyroscope */,
  SDL_SENSOR_ACCEL_L /**< Accelerometer for left Joy-Con controller and Wii nunchuk */,
  SDL_SENSOR_GYRO_L /**< Gyroscope for left Joy-Con controller */,
  SDL_SENSOR_ACCEL_R /**< Accelerometer for right Joy-Con controller */,
  SDL_SENSOR_GYRO_R /**< Gyroscope for right Joy-Con controller */,
}
