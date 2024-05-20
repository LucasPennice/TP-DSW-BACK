enum Sexo {
    Mujer = "Mujer",
    Hombre = "Hombre"
  }

export class Profesor{
    nombre : String
    apellido : String
    fechaNacimiento : Date
    dni: Number
    cargos : String[]
    horarioDeClase: Date[]
    puntuacionGeneral: Number
    sexo: Sexo

    constructor() { 
        this.nombre = "Peter"
        this.apellido = "Peter"
        this.fechaNacimiento = new Date()
        this.dni = 43167696
        this.cargos = ["Profesor!"]
        this.horarioDeClase = [new Date()]
        this.puntuacionGeneral = 100
        this.sexo = Sexo.Hombre
    }

}