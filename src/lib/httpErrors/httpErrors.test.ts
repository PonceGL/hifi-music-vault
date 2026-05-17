import {
  BadRequestError,
  HttpError,
  ImageNotFoundException,
  InternalServerErrorException,
  NotFoundException,
  UnsupportedPlatformError,
  UserCanceledDialogException,
  UserNotFoundException,
} from "./index";

describe("HttpError and its extensions", () => {
  describe("HttpError base class", () => {
    it("should create an HttpError with custom status code and message", () => {
      const error = new HttpError(418, "I'm a teapot");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HttpError);
      expect(error.statusCode).toBe(418);
      expect(error.message).toBe("I'm a teapot");
    });

    it("should maintain prototype chain for instanceof checks", () => {
      const error = new HttpError(500, "Test error");
      expect(Object.getPrototypeOf(error)).toBe(HttpError.prototype);
    });
  });

  describe("NotFoundException", () => {
    it("should create with default message", () => {
      const error = new NotFoundException();
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Recurso no encontrado");
    });

    it("should create with custom message", () => {
      const error = new NotFoundException("Usuario no encontrado");
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Usuario no encontrado");
    });
  });

  describe("InternalServerErrorException", () => {
    it("should create with default message", () => {
      const error = new InternalServerErrorException();
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Error interno del servidor");
    });

    it("should create with custom message", () => {
      const error = new InternalServerErrorException("Error de base de datos");
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Error de base de datos");
    });
  });

  describe("BadRequestError", () => {
    it("should create with default message", () => {
      const error = new BadRequestError();
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Solicitud incorrecta");
    });

    it("should create with custom message", () => {
      const error = new BadRequestError("Datos inválidos");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Datos inválidos");
    });
  });

  describe("ImageNotFoundException", () => {
    it("should create with default message", () => {
      const error = new ImageNotFoundException();
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toBeInstanceOf(ImageNotFoundException);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Imagen no encontrada");
    });

    it("should create with custom message", () => {
      const error = new ImageNotFoundException("La imagen del álbum no existe");
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("La imagen del álbum no existe");
    });
  });

  describe("UserNotFoundException", () => {
    it("should create with default message", () => {
      const error = new UserNotFoundException();
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toBeInstanceOf(UserNotFoundException);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Usuario no encontrado");
    });

    it("should create with custom message", () => {
      const error = new UserNotFoundException("Admin no encontrado");
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Admin no encontrado");
    });
  });

  describe("UnsupportedPlatformError", () => {
    it("should create with default message", () => {
      const error = new UnsupportedPlatformError();
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toBeInstanceOf(UnsupportedPlatformError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Plataforma no soportada");
    });

    it("should create with custom message", () => {
      const error = new UnsupportedPlatformError("Linux no soportado");
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Linux no soportado");
    });
  });

  describe("UserCanceledDialogException", () => {
    it("should create with default message", () => {
      const error = new UserCanceledDialogException();
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toBeInstanceOf(UserCanceledDialogException);
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Dialogo cancelado por el usuario");
    });

    it("should create with custom message", () => {
      const error = new UserCanceledDialogException("Cancelado manualmente");
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Cancelado manualmente");
    });
  });
});
