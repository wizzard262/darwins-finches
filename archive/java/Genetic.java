// Genetic Algorithm Java classes
//
// Copyright 1996, Mark Watson.  All rights reserved.

//package mwa.ai.genetic;

import java.util.*;

/////////////////////////////////////////////////////////////////////////////////////////////
public class Genetic  extends Object
{
 protected int NumGenes;  // number of genes per chromosome
 protected int NumChrom;  // number of chromosomes
 protected BitSet Genes[];
 protected double Fitness[];   // NB changed from a float

   public Genetic()//constructor
   {
    System.out.println("In dummy Genetic constructor");
    NumGenes = NumChrom = 0;
   }

   public void init(int g, int c)//method
   {
    System.out.println("In Genetic::init(...)");
    Genes = new BitSet[c];
    for(int i=0; i<c; i++)
       {
        Genes[i] = new BitSet(g);
        for(int j=0; j<g; j++)
           {
            if(Math.random() < 0.5)
               Genes[i].set(j);
           }
        }
    NumChrom = c;
    NumGenes = g;
    Fitness = new double[c];    // NB changed from float
    for(int f=0; f<c; f++)
        Fitness[f] = -999;

        Sort();
   } //end init

   public boolean GetGene(int chromosome, int gene)//method
   {return Genes[chromosome].get(gene);}  //end GetGene()

   public void SetGene(int chromosome, int gene, int value)//method
   {
    if(value == 0)
       Genes[chromosome].clear(gene);
    else
       Genes[chromosome].set(gene);
   }    //end  SetGene()

   public void SetGene(int chromosome, int gene, boolean value)//method
   {
    if(value)
      Genes[chromosome].set(gene);
    else
      Genes[chromosome].clear(gene);
   }  // end SetGene()

   public void Sort()//method
   {
    BitSet btemp;
    for(int c=0; c<NumChrom; c++)
       {
        for(int d=(NumChrom - 2); d>=c; d--)
           {
            if(Fitness[d] < Fitness[d+1])
              {
               btemp = Genes[d];
               double x = Fitness[d];       // NB changed from float
               Genes[d] = Genes[d+1];
               Fitness[d] = Fitness[d+1];
               Genes[d+1] = btemp;
               Fitness[d+1] = x;
              }
           }
       }
   }//end Sort()

    public void DoCrossovers()//method
    {
     for(int m=0; m<NumChrom/2; m++)
        {CopyGene(m + NumChrom/2, m);}

      // copy the 2 best genes best genes so that their
      // genetc material is replicated frequently:

     for(int i=0; i<NumGenes; i++)
        {
         SetGene(NumChrom - 1, i, GetGene(0, i));
         SetGene(NumChrom - 2, i, GetGene(0, i));
         SetGene(NumChrom - 3, i, GetGene(0, i));
         SetGene(NumChrom - 4, i, GetGene(1, i));
         SetGene(NumChrom - 5, i, GetGene(1, i));
        }

    int num = NumChrom / 4;

    for(int i=0; i<num; i++)
       {
        int c1 = 2 + (int)((NumChrom - 2) * Math.random() * 0.99);
        int c2 = 2 + (int)((NumChrom - 2) * Math.random() * 0.99);
        if(c1 != c2)
          {
           int locus = 2 + (int)((NumGenes - 3) * Math.random());
           for(int g=0; g<locus; g++)
              {
               boolean temp = GetGene(c1, i);
               SetGene(c1, i, GetGene(c2, i));
               SetGene(c2, i, temp);
              }
          }
      }
  }  //end DoCrossovers

    // 'to' and 'from' are 'sorted' indices:
  private void CopyGene(int to, int from)//method
  {
   for(int i=0; i<NumGenes; i++)
      if(GetGene(from, i))
         SetGene(to, i, 1);
      else
          SetGene(to, i, 0);
  }//end CopyGene()

  public void DoMutations()//method
  {
   int c = 2 + (int)((NumChrom - 2) * Math.random() * 0.95);
   int g = (int)(NumGenes * Math.random() * 0.95);
   if(GetGene(c, g))
      SetGene(c, g, 0);
   else
      SetGene(c, g, 1);
  }

  public void CalcFitness()//method     Override the following function in sub-classes:
  {}
} // end class Genetic
///////////////////////////////////////////////////////////////////////////////////////////////

 class testGenetic
{
 static public void main(String argv[])
 {
  MyGenetic G = new MyGenetic();
  G.init(20,15);                   //(X genes/chrom,Y chrom in pop)
  for(int i=0; i<51; i++)
     {
      G.CalcFitness();
      G.Sort();
      if((i%5)==0)
        {
         System.out.println("Generation " + i);
         G.Print();
        }
     G.DoCrossovers();
     G.DoMutations();
    }
     G.FinalPrint();
 }//end main
} //end class testGenetic


//////////////////////////////////////////////////////////////////////////////////////////////

class MyGenetic extends Genetic
{
 double V=0;
 double W=0;
 double X=0;
 double Y=0;
 double Z=0;

 MyGenetic()// default no arg constructor
 {System.out.println("Entered MyGenetic::MyGenetic()\n");}

 public void init(int g, int c)//method
 {super.init(g, c);}

 public void CalcFitness()//method
 {
  for(int i=0; i<NumChrom; i++)
     {double A=0;
      double B=0;
      double C=0;
      double D=0;
      double E=0;
      V=0;
      W=0;
      X=0;
      Y=0;
      Z=0;
      // for intelligence genes
      if(GetGene(i, 0))
         V+=1;
      if(GetGene(i, 1))
         V+=2;
      if(GetGene(i, 2))
         V+=4;
      if(GetGene(i, 3))
         V+=8;
      A=(1.3333*V);

      // for speed genes
      if(GetGene(i, 4))
         W+=1;
      if(GetGene(i, 5))
         W+=2;
      if(GetGene(i, 6))
         W+=4;
      if(GetGene(i, 7))
         W+=8;
      B=4*(Math.sin(W))+W+2;

      // for size genes
      if(GetGene(i, 8))
         X+=1;
      if(GetGene(i, 9))
         X+=2;
      if(GetGene(i,10))
         X+=4;
      if(GetGene(i,11))
         X+=8;
      C=(20-(1.25*X));

       // for beak genes
      if(GetGene(i,12))
         Y+=1;
      if(GetGene(i,13))
         Y+=2;
      if(GetGene(i,14))
         Y+=4;
      if(GetGene(i,15))
         Y+=8;
      D=4*(Math.sin(Y))-2*(Math.abs(8-Y))+16;

      // for feathers genes
      if(GetGene(i,16))
         Z+=1;
      if(GetGene(i,17))
         Z+=2;
      if(GetGene(i,18))
         Z+=4;
      if(GetGene(i,19))
         Z+=8;
      E=(20-(Math.abs(Z-8))*2.5);

      Fitness[i]= A+B+C+D+E;
     }
 }//end CalcFitness

 public void Print()//method
 {
  for (int i=0; i<2; i++)
      {
       System.out.print("Fitness for chromosome ");
       System.out.print(i);
       System.out.print(" is ");
       System.out.println(Fitness[i]);
      }
   } //end Print

 public void FinalPrint()//method
 {
  System.out.print  ("Intelligence  ");
  System.out.println(V);
  System.out.print  ("Speed         ");
  System.out.println(W);
  System.out.print  ("Size          ");
  System.out.println(X);
  System.out.print  ("Beak          ");
  System.out.println(Y);
  System.out.print  ("Feathers      ");
  System.out.println(Z);
 } //end Print
}

