using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RS1_2024_25.API.Migrations
{
    /// <inheritdoc />
    public partial class EntitiesSprint1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MyAuthenticationTokens_MyAppUsers_MyAppUserId",
                table: "MyAuthenticationTokens");

            migrationBuilder.DropTable(
                name: "MyAppUsers");

            migrationBuilder.RenameColumn(
                name: "MyAppUserId",
                table: "MyAuthenticationTokens",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_MyAuthenticationTokens_MyAppUserId",
                table: "MyAuthenticationTokens",
                newName: "IX_MyAuthenticationTokens_UserId");

            migrationBuilder.CreateTable(
                name: "BodyTypes",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BodyTypes", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "StatusTypes",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StatusName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StatusTypes", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAdmin = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Cars",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    EngineCapacity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FuelType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transmission = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Doors = table.Column<int>(type: "int", nullable: false),
                    FuelConsumption = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BodyID = table.Column<int>(type: "int", nullable: false),
                    CityID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cars", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Cars_BodyTypes_BodyID",
                        column: x => x.BodyID,
                        principalTable: "BodyTypes",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Cars_Cities_CityID",
                        column: x => x.CityID,
                        principalTable: "Cities",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Carts",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    StatusID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carts", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Carts_StatusTypes_StatusID",
                        column: x => x.StatusID,
                        principalTable: "StatusTypes",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Carts_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Advertisements",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Condition = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ListingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CarID = table.Column<int>(type: "int", nullable: false),
                    UserID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Advertisements", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Advertisements_Cars_CarID",
                        column: x => x.CarID,
                        principalTable: "Cars",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Advertisements_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Advertisements_CarID",
                table: "Advertisements",
                column: "CarID");

            migrationBuilder.CreateIndex(
                name: "IX_Advertisements_UserID",
                table: "Advertisements",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Cars_BodyID",
                table: "Cars",
                column: "BodyID");

            migrationBuilder.CreateIndex(
                name: "IX_Cars_CityID",
                table: "Cars",
                column: "CityID");

            migrationBuilder.CreateIndex(
                name: "IX_Carts_StatusID",
                table: "Carts",
                column: "StatusID");

            migrationBuilder.CreateIndex(
                name: "IX_Carts_UserID",
                table: "Carts",
                column: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_MyAuthenticationTokens_Users_UserId",
                table: "MyAuthenticationTokens",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MyAuthenticationTokens_Users_UserId",
                table: "MyAuthenticationTokens");

            migrationBuilder.DropTable(
                name: "Advertisements");

            migrationBuilder.DropTable(
                name: "Carts");

            migrationBuilder.DropTable(
                name: "Cars");

            migrationBuilder.DropTable(
                name: "StatusTypes");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "BodyTypes");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "MyAuthenticationTokens",
                newName: "MyAppUserId");

            migrationBuilder.RenameIndex(
                name: "IX_MyAuthenticationTokens_UserId",
                table: "MyAuthenticationTokens",
                newName: "IX_MyAuthenticationTokens_MyAppUserId");

            migrationBuilder.CreateTable(
                name: "MyAppUsers",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAdmin = table.Column<bool>(type: "bit", nullable: false),
                    IsManager = table.Column<bool>(type: "bit", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MyAppUsers", x => x.ID);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_MyAuthenticationTokens_MyAppUsers_MyAppUserId",
                table: "MyAuthenticationTokens",
                column: "MyAppUserId",
                principalTable: "MyAppUsers",
                principalColumn: "ID");
        }
    }
}
