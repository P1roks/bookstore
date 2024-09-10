{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    typescript
    mariadb
    nodePackages.ts-node
    nodePackages.nodemon
  ];
}
