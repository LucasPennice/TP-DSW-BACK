export enum Sexo {
    Mujer = "Mujer",
    Hombre = "Hombre"
  }

export class Profesor{
    nombre : String
    apellido : String
    fechaNacimiento : Date
    dni: Number
    cargos : String[]
    horarioDeClase: String[] // "DIA_SEMANA - HH:MM" formato 24hs
    puntuacionGeneral: Number
    sexo: Sexo

    constructor(nombre: String, apellido: String, fechaNacimiento: Date, dni: Number, cargos: String[], horariosDeClase: String[], puntuacionGeneral: Number, sexo: Sexo) { 
        this.nombre = "Peter"
        this.apellido = "Peter"
        this.fechaNacimiento = new Date()
        this.dni = 43167696
        this.cargos = ["Profesor!"]
        this.horarioDeClase = []
        this.puntuacionGeneral = 100
        this.sexo = Sexo.Hombre
    }

}