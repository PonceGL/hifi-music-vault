/**
 * Clase base para todos los errores HTTP personalizados.
 */
export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * Excepción para errores 404 (No Encontrado).
 */
export class NotFoundException extends HttpError {
  constructor(message: string = "Recurso no encontrado") {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}
/**
 * Excepción Especifica, para controlar los errores de la imagen para errores 404 (No Encontrado).
 */
export class ImageNotFoundException extends HttpError {
  constructor(message: string = "Imagen no encontrada") {
    super(404, message);
    Object.setPrototypeOf(this, ImageNotFoundException.prototype);
  }
}
/**
 * Excepción Especifica, para controlar los errores de las usuarios para errores 404 (No Encontrado).
 */
export class UserNotFoundException extends HttpError {
  constructor(message: string = "Usuario no encontrado") {
    super(404, message);
    Object.setPrototypeOf(this, UserNotFoundException.prototype);
  }
}

/**
 * Excepción para errores 500 (Error Interno del Servidor).
 */
export class InternalServerErrorException extends HttpError {
  constructor(message: string = "Error interno del servidor") {
    super(500, message);
    Object.setPrototypeOf(this, InternalServerErrorException.prototype);
  }
}

export class UnsupportedPlatformError extends HttpError {
  constructor(message: string = "Plataforma no soportada") {
    super(500, message);
    Object.setPrototypeOf(this, UnsupportedPlatformError.prototype);
  }
}

export class UserCanceledDialogException extends HttpError {
  constructor(message: string = "Dialogo cancelado por el usuario") {
    super(409, message);
    Object.setPrototypeOf(this, UserCanceledDialogException.prototype);
  }
}

/**
 * Excepción para errores 400 (Solicitud Incorrecta).
 */
export class BadRequestError extends HttpError {
  constructor(message: string = "Solicitud incorrecta") {
    super(400, message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
