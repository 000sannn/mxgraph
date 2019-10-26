import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { GraphEditorComponent } from "./graph-editor/graph-editor.component";

const routes: Routes = [{ path: "graph", component: GraphEditorComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
