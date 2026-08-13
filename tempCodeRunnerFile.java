// Online Java Compiler
// Use this editor to write, compile and run your Java code online

class Main {
    public static void main(String[] args) {
       int[] arr = {1,2,3,4,5,6,7,10};
       int comcount = 0;
   

       for(int i=0;i<arr.length;i++){
         int count = 0;
           for(int j=1;j<=arr[i];j++){
            //   int count = 0;
               if(arr[i] % j == 0){
                   count++;
               }
           }
           if(count > 2){
               System.out.print(arr[i]);
               comcount++;
           }
           System.out.println(comcount++);
       }
    }
}